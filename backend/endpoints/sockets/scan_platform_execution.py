from __future__ import annotations

import asyncio
from typing import cast

from rq import get_current_job
from sqlalchemy.exc import SQLAlchemyError

from config import SCAN_WORKERS
from config.config_manager import config_manager as cm
from endpoints.sockets.scan_media import _emit_scanning_rom, _hydrate_media_urls
from endpoints.sockets.scan_platform_identification import _identify_platform
from endpoints.sockets.scan_runtime import (
    STOP_SCAN_FLAG,
    ScanStats,
    _get_running_scan_job,
    _get_socket_manager,
)
from exceptions.fs_exceptions import (
    FOLDER_STRUCT_MSG,
    FolderStructureNotMatchException,
    RomsNotFoundException,
)
from exceptions.socket_exceptions import ScanStoppedException
from handler.database import db_collection_handler, db_platform_handler, db_rom_handler
from handler.database.scan_write_fence import (
    ScanWriteRejected,
    require_scan_write_context,
)
from handler.filesystem import (
    fs_platform_handler,
    legacy_external_storage,
    open_storage_access,
)
from handler.filesystem.storage_access import (
    IndeterminateOwnedPublicationError,
    ScanCapability,
)
from handler.filesystem.storage_policy import StorageOperation
from handler.metadata import meta_gamelist_handler, meta_hltb_handler
from handler.metadata.rom_media import refresh_provider_owned_media
from handler.metadata.ss_handler import begin_scan as begin_ss_scan
from handler.metadata.ss_handler import log_scan_summary as log_ss_scan_summary
from handler.redis_handler import redis_client
from handler.scan_handler import MetadataSource, ScanType
from logger.formatter import LIGHTYELLOW
from logger.formatter import highlight as hl
from logger.logger import log
from models.platform import Platform
from models.rom import Rom
from utils import emoji
from utils.context import initialize_context
from utils.platform_slugs import canonicalize_filesystem_slug


@initialize_context()
async def scan_platforms(
    platform_ids: list[int],
    metadata_sources: list[str],
    scan_type: ScanType = ScanType.QUICK,
    roms_ids: list[int] | None = None,
    launchbox_remote_enabled: bool = True,
    playmatch_enabled: bool = True,
    platform_fs_slugs: list[str] | None = None,
    filesystem_platform_scope: list[str] | None = None,
    metadata_locale: str | None = None,
    metadata_only: bool = False,
    media_only: bool = False,
    filesystem_scope_path: str | None = None,
) -> ScanStats:
    """Scan all the listed platforms and fetch metadata from different sources

    Args:
        platform_ids (list[int]): List of platform ids to be scanned
        metadata_sources (list[str]): List of metadata sources to be used
        scan_type (ScanType): Type of scan to be performed.
        roms_ids (list[int], optional): List of selected roms to be scanned.
        platform_fs_slugs (list[str], optional): Folders to scan with no database row.
    """
    require_scan_write_context()
    from handler.scan_operation_worker import check_worker_boundary

    check_worker_boundary()
    with cast(
        ScanCapability,
        open_storage_access(legacy_external_storage, StorageOperation.SCAN, ""),
    ) as access:
        access.scan()

    # The flag is cleared by the scan that observes it, so one set against a
    # scan that ended first would otherwise stop this one before it began. A
    # scan still on a worker owns the flag though, and clearing it there would
    # let a stopped scan carry on.
    running_job = _get_running_scan_job()
    current_job = get_current_job()
    if running_job is None or (
        current_job is not None and running_job.id == current_job.id
    ):
        redis_client.delete(STOP_SCAN_FLAG)

    if not roms_ids:
        roms_ids = []

    if not platform_fs_slugs:
        platform_fs_slugs = []

    socket_manager = _get_socket_manager()
    scan_stats = ScanStats()

    if media_only:
        if metadata_only:
            raise ValueError("media_only and metadata_only cannot be combined")
        existing_roms = list(
            db_rom_handler.get_roms_scalar(
                platform_ids=platform_ids or None,
            )
        )
        requested_ids = set(roms_ids or [])
        if requested_ids:
            existing_roms = [rom for rom in existing_roms if rom.id in requested_ids]
        await scan_stats.update(
            socket_manager=socket_manager,
            total_platforms=0,
            total_roms=len(existing_roms),
        )
        semaphore = asyncio.Semaphore(SCAN_WORKERS)

        async def refresh_existing_rom(rom: Rom) -> None:
            async with semaphore:
                try:
                    rom, hydrated_provider = await _hydrate_media_urls(
                        rom, metadata_sources, metadata_locale
                    )
                    refreshed, media_failures = await refresh_provider_owned_media(
                        rom,
                        rom.updated_at,
                        hydrated_provider
                        or (metadata_sources[0] if metadata_sources else "provider"),
                    )
                except (ValueError, OSError) as exc:
                    log.warning("Media-only refresh failed for %s: %s", rom.id, exc)
                    return
                for failure in media_failures:
                    log.warning(
                        "Provider media item failed for ROM %s (%s/%s): %s",
                        rom.id,
                        failure.role.value,
                        failure.provider_media_id,
                        failure.reason,
                    )
                await scan_stats.increment(
                    socket_manager=socket_manager,
                    scanned_roms=1,
                    identified_roms=1 if refreshed.is_identified else 0,
                )
                await _emit_scanning_rom(socket_manager, refreshed)

        await asyncio.gather(*(refresh_existing_rom(rom) for rom in existing_roms))
        await socket_manager.emit("scan:done", scan_stats.to_dict())
        return scan_stats

    # ScreenScraper's scan state is process-global, so a scan that never touches
    # it must leave it alone: under DEV_MODE scans run in-process and can
    # overlap, and resetting would drop the other scan's limits and skips.
    if MetadataSource.SS in metadata_sources:
        await begin_ss_scan()

    if filesystem_platform_scope is not None:
        fs_platforms = filesystem_platform_scope
    else:
        try:
            fs_platforms = await fs_platform_handler.get_platforms()
        except FolderStructureNotMatchException as e:
            log.error(e)
            await socket_manager.emit("scan:done_ko", e.message)
            return scan_stats

    # Clear the gamelist cache to ensure we're using fresh gamelist.xml data
    meta_gamelist_handler.clear_cache()

    # Initialize HLTB handler (fetches current search endpoint and security token)
    if MetadataSource.HLTB in metadata_sources:
        meta_hltb_handler.initialize()

    # Resolve the platforms that will actually be scanned. When no platform ids
    # are provided, every filesystem platform is scanned.
    db_platforms = db_platform_handler.get_platforms()
    db_platforms_by_slug = {
        canonicalize_filesystem_slug(p.fs_slug): p for p in db_platforms
    }

    # Selected platforms arrive as database ids and/or filesystem slugs.
    selected_slugs = [
        canonicalize_filesystem_slug(p.fs_slug)
        for p in db_platforms
        if p.id in platform_ids
    ]
    filesystem_slugs = {
        canonicalize_filesystem_slug(fs_slug) for fs_slug in fs_platforms
    }
    for fs_slug in platform_fs_slugs:
        fs_slug = canonicalize_filesystem_slug(fs_slug)
        if fs_slug in selected_slugs:
            continue
        if fs_slug in db_platforms_by_slug or fs_slug in filesystem_slugs:
            selected_slugs.append(fs_slug)

    has_selection = bool(platform_ids or platform_fs_slugs)
    platform_list = sorted(
        set(selected_slugs)
        if has_selection
        else {canonicalize_filesystem_slug(fs_slug) for fs_slug in fs_platforms}
    )

    # A "new platforms" scan skips platforms that already exist in the database,
    # so they must be excluded from the totals to keep the tracker accurate. This
    # mirrors the existence check done per-platform in _identify_platform, reusing
    # the platforms already fetched above instead of querying again per platform.
    platforms_to_scan = platform_list
    if scan_type == ScanType.NEW_PLATFORMS:
        platforms_to_scan = [
            platform_slug
            for platform_slug in platform_list
            if db_platforms_by_slug.get(platform_slug) is None
        ]

    total_roms = 0
    for platform_slug in platforms_to_scan:
        try:
            from handler.scan_collection_discovery import count_scan_inventory

            total_roms += await count_scan_inventory(
                Platform(fs_slug=platform_slug), filesystem_scope_path
            )
        except RomsNotFoundException as e:
            log.error(e)

    await scan_stats.update(
        socket_manager=socket_manager,
        total_platforms=len(platforms_to_scan),
        total_roms=total_roms,
    )

    async def stop_scan():
        log.info(f"{emoji.EMOJI_STOP_SIGN} Scan stopped manually")
        await socket_manager.emit("scan:done", scan_stats.to_dict())
        redis_client.delete(STOP_SCAN_FLAG)

    try:
        if len(platform_list) == 0:
            log.warning(
                f"{hl(emoji.EMOJI_WARNING, color=LIGHTYELLOW)} No platforms found, verify that the folder structure is right and the volume is mounted correctly."
                f"{FOLDER_STRUCT_MSG}"
            )
        else:
            log.info(
                f"Found {hl(str(len(platform_list)))} platforms in the file system"
            )

        for platform_slug in platform_list:
            scan_stats = await _identify_platform(
                platform_slug=platform_slug,
                scan_type=scan_type,
                fs_platforms=fs_platforms,
                roms_ids=roms_ids,
                metadata_sources=metadata_sources,
                launchbox_remote_enabled=launchbox_remote_enabled,
                playmatch_enabled=playmatch_enabled,
                metadata_locale=metadata_locale,
                metadata_only=metadata_only,
                socket_manager=socket_manager,
                scan_stats=scan_stats,
                filesystem_scope_path=filesystem_scope_path,
            )

        missed_platforms = db_platform_handler.mark_missing_platforms(
            fs_platforms,
            platform_ids=(
                platform_ids if filesystem_platform_scope is not None else None
            ),
        )
        if len(missed_platforms) > 0:
            log.warning(f"{hl('Missing')} platforms from filesystem:")
            for p in missed_platforms:
                log.warning(f" - {p.slug} ({p.fs_slug})")

        if MetadataSource.SS in metadata_sources:
            log_ss_scan_summary()

        log.info(f"{emoji.EMOJI_CHECK_MARK} Scan completed")

        # The library changed; drop cached filter values.
        db_rom_handler.invalidate_filter_values_cache()

        # Smart collection membership is derived from the library, and is no
        # longer recomputed while serving a gallery page. The scan itself is
        # done, so a failure here must not report it as one.
        try:
            db_collection_handler.refresh_smart_collections()
        except (ScanWriteRejected, IndeterminateOwnedPublicationError, SQLAlchemyError):
            raise
        except Exception as e:
            log.error(f"Couldn't refresh smart collections after the scan: {e}")

        # Export metadata files if enabled in config
        config = cm.get_config()

        # Update the list of platforms after the scan to ensure we have the latest data
        db_platforms = db_platform_handler.get_platforms()
        db_platforms_by_slug = {p.fs_slug: p for p in db_platforms}

        if config.GAMELIST_AUTO_EXPORT_ON_SCAN or config.PEGASUS_AUTO_EXPORT_ON_SCAN:
            from handler.filesystem.scan_output_publication import export_scan_platform

            for platform_slug in platform_list:
                platform = db_platforms_by_slug.get(platform_slug)
                if platform is not None:
                    export_scan_platform(
                        platform.id,
                        gamelist=config.GAMELIST_AUTO_EXPORT_ON_SCAN,
                        pegasus=config.PEGASUS_AUTO_EXPORT_ON_SCAN,
                    )

        await socket_manager.emit("scan:done", scan_stats.to_dict())
    except ScanStoppedException:
        await stop_scan()
    except (ScanWriteRejected, IndeterminateOwnedPublicationError, SQLAlchemyError):
        raise
    except Exception as e:
        log.error(f"Error in scan_platform: {e}")
        # Catch all exceptions and emit error to the client
        await socket_manager.emit("scan:done_ko", str(e))
        # Re-raise the exception to be caught by the error handler
        raise e

    return scan_stats

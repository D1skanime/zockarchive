from __future__ import annotations

import socketio  # type: ignore
from httpx import DecodingError, TransportError
from sqlalchemy.exc import IntegrityError

from config.config_manager import config_manager as cm
from endpoints.sockets.scan_decisions import _should_get_rom_files
from endpoints.sockets.scan_media import _emit_scanning_rom, _enrich_pc_dlc_from_igdb
from endpoints.sockets.scan_runtime import STOP_SCAN_FLAG, ScanStats
from handler.database import db_rom_handler
from handler.database.catalog_lifecycle_handler import CatalogLifecycleHandler
from handler.database.scan_write_fence import require_scan_write_context
from handler.filesystem import fs_resource_handler, get_fs_rom_handler
from handler.filesystem.roms_handler import FSRom
from handler.filesystem.scan_media_inventory import ScanMediaInventory
from handler.filesystem.scan_media_publication import (
    ScanMediaBatch,
    merge_scan_rom,
    publish_rom_resources,
)
from handler.metadata.base_handler import UniversalPlatformSlug as UPS
from handler.metadata.rom_media import refresh_provider_owned_media
from handler.metadata.ss_handler import add_ss_auth_to_url, get_preferred_media_types
from handler.redis_handler import redis_client
from handler.scan_handler import (
    MetadataSource,
    ScanType,
    persist_soundtrack_cover,
    process_pc_automation_after_scan,
    scan_rom,
)
from logger.formatter import BLUE
from logger.formatter import highlight as hl
from logger.logger import log
from models.platform import Platform
from models.rom import Rom

catalog_lifecycle_handler = CatalogLifecycleHandler()


async def _identify_rom(
    platform: Platform,
    fs_rom: FSRom,
    rom: Rom | None,
    scan_type: ScanType,
    roms_ids: list[int],
    metadata_sources: list[str],
    launchbox_remote_enabled: bool,
    playmatch_enabled: bool,
    socket_manager: socketio.AsyncRedisManager,
    scan_stats: ScanStats,
    metadata_locale: str | None = None,
    metadata_only: bool = False,
) -> None:
    require_scan_write_context()
    from handler.scan_operation_worker import check_worker_boundary

    check_worker_boundary()
    # Break early if the flag is set
    if redis_client.get(STOP_SCAN_FLAG):
        return

    # Update properties that don't require metadata
    parsed_tags = get_fs_rom_handler().parse_tags(fs_rom["fs_name"])
    roms_path = get_fs_rom_handler().get_logical_roms_fs_structure(platform.fs_slug)

    rom_attrs = {
        "fs_name": fs_rom["fs_name"],
        "fs_path": roms_path,
        "regions": parsed_tags.regions,
        "revision": parsed_tags.revision,
        "version": parsed_tags.version,
        "languages": parsed_tags.languages,
        "tags": parsed_tags.other_tags,
        "platform_id": platform.id,
        "name": get_fs_rom_handler().get_file_name_with_no_tags(fs_rom["fs_name"]),
        "url_cover": "",
        "url_manual": "",
        "url_screenshots": [],
    }

    calculate_hashes = not cm.get_config().SKIP_HASH_CALCULATION

    from handler.windows_quick_execution import (
        current_windows_quick,
        inventory_binding,
        prepare_quick_refresh,
        reconcile_quick_files,
    )

    quick = current_windows_quick()
    if quick is not None:
        candidate = rom if rom is not None else Rom(**rom_attrs, platform=platform)
        await prepare_quick_refresh(
            quick, get_fs_rom_handler(), candidate, calculate_hashes=calculate_hashes
        )

    newly_added: bool = rom is None
    reassociated: bool = False
    files_built: bool = False

    if rom is None:
        # No entry matches this filename. Before treating it as new, hash
        # the files and check whether they belong to an existing entry that went
        # missing (a renamed or moved ROM), so its collections, notes, and
        # uploaded assets carry over instead of being orphaned on a duplicate.
        parsed_rom_files = (
            quick.files
            if quick is not None
            else await get_fs_rom_handler().get_rom_files(
                Rom(**rom_attrs, platform=platform),
                calculate_hashes=calculate_hashes,
            )
        )
        fs_rom.update(
            {
                "files": parsed_rom_files.rom_files,
                "crc_hash": parsed_rom_files.crc_hash,
                "md5_hash": parsed_rom_files.md5_hash,
                "sha1_hash": parsed_rom_files.sha1_hash,
                "ra_hash": parsed_rom_files.ra_hash,
            }
        )
        files_built = True

        missing_match = db_rom_handler.get_matching_missing_rom(
            platform_id=platform.id,
            logical_path=f"{roms_path}/{fs_rom['fs_name']}",
            crc_hash=parsed_rom_files.crc_hash,
            md5_hash=parsed_rom_files.md5_hash,
            sha1_hash=parsed_rom_files.sha1_hash,
        )
        if missing_match is not None:
            # Move the existing entry onto the new file, clearing its missing state.
            rom = db_rom_handler.update_rom(
                missing_match.id,
                {
                    "fs_name": fs_rom["fs_name"],
                    "fs_path": roms_path,
                    "regions": parsed_tags.regions,
                    "revision": parsed_tags.revision,
                    "version": parsed_tags.version,
                    "languages": parsed_tags.languages,
                    "tags": parsed_tags.other_tags,
                    "missing_from_fs": False,
                },
            )
            reassociated = True
            newly_added = False
            log.info(
                f"Reassociated {hl(fs_rom['fs_name'])} with existing entry "
                f"{hl(rom.name or rom.fs_name, color=BLUE)} by file hash"
            )
        else:
            try:
                rom = db_rom_handler.add_rom(Rom(**rom_attrs))
            except IntegrityError:
                # A concurrent scan already created this ROM, so skip it here.
                log.debug(
                    f"Skipping {hl(fs_rom['fs_name'])}: already created by a concurrent scan"
                )
                return

    # Build rom files object before scanning. A reassociated ROM always rebuilds
    # its files so the stale paths from the old filename are replaced.
    should_update_files = not metadata_only and (
        quick is not None
        or reassociated
        or _should_get_rom_files(
            scan_type=scan_type,
            rom=rom,
            newly_added=newly_added,
            roms_ids=roms_ids,
        )
    )
    if should_update_files and not files_built:
        # Get hash calculation setting from config
        if calculate_hashes:
            log.debug(f"Calculating file hashes for {rom.fs_name}...")

        parsed_rom_files = (
            quick.files
            if quick is not None
            else await get_fs_rom_handler().get_rom_files(
                rom, calculate_hashes=calculate_hashes
            )
        )
        fs_rom.update(
            {
                "files": parsed_rom_files.rom_files,
                "crc_hash": parsed_rom_files.crc_hash,
                "md5_hash": parsed_rom_files.md5_hash,
                "sha1_hash": parsed_rom_files.sha1_hash,
                "ra_hash": parsed_rom_files.ra_hash,
            }
        )

    log.debug(f"Scanning {rom.fs_name}...")
    scanned_rom = await scan_rom(
        scan_type=scan_type,
        platform=platform,
        rom=rom,
        fs_rom=fs_rom,
        metadata_sources=metadata_sources,
        newly_added=newly_added,
        launchbox_remote_enabled=launchbox_remote_enabled,
        playmatch_enabled=playmatch_enabled,
        metadata_locale=metadata_locale,
        metadata_only=metadata_only,
        socket_manager=socket_manager,
    )

    await scan_stats.increment(
        socket_manager=socket_manager,
        scanned_roms=1,
        new_roms=1 if newly_added else 0,
        identified_roms=1 if scanned_rom.is_identified else 0,
    )

    _added_rom = merge_scan_rom(scanned_rom)

    catalog_lifecycle_handler.reconnect_retained_identity(
        rom_id=_added_rom.id,
        platform_id=platform.id,
        logical_path=f"{roms_path}/{fs_rom['fs_name']}",
        crc_hash=fs_rom["crc_hash"],
        md5_hash=fs_rom["md5_hash"],
        sha1_hash=fs_rom["sha1_hash"],
    )

    if _added_rom.is_identified:
        await _emit_scanning_rom(socket_manager, _added_rom)

    if quick is not None and quick.binding is None:
        quick.binding = inventory_binding(
            _added_rom, fs_rom.get("scan_relative_path", _added_rom.fs_name)
        )

    if should_update_files:
        # Reconcile against the existing rows instead of replacing them, so file
        # ids survive a rescan and anything keyed on them (track metadata,
        # persisted soundtrack covers) stays valid.
        with ScanMediaBatch(
            _added_rom.id, _added_rom.platform_id, fs_resource_handler.storage
        ) as unit:
            if quick is not None:
                synced, synced_components = unit.publish_and_associate(
                    lambda session: reconcile_quick_files(
                        quick, get_fs_rom_handler(), _added_rom, session
                    )
                )
                quick.files_reconciled = True
                quick.components_reconciled = True
                from handler.scan_handler import auto_link_pc_dlc_components

                auto_link_pc_dlc_components(rom, synced_components)
            else:
                synced = unit.publish_and_associate(
                    lambda session: db_rom_handler.sync_rom_files(
                        _added_rom.id, fs_rom["files"], session=session
                    )
                )
        for saved in synced.files:
            persist_soundtrack_cover(saved, _added_rom)

    if (
        not metadata_only
        and platform.slug == UPS.WIN
        and isinstance(_added_rom.igdb_metadata, dict)
    ):
        enriched_parent = db_rom_handler.apply_pc_igdb_enrichment(
            _added_rom.id,
            _added_rom.updated_at,
            {
                "igdb_id": _added_rom.igdb_id,
                "name": _added_rom.name,
                "summary": _added_rom.summary,
                "igdb_metadata": _added_rom.igdb_metadata,
            },
        )
        if enriched_parent is not None:
            _added_rom = enriched_parent
            refreshed_rom = db_rom_handler.get_rom(_added_rom.id)
            if refreshed_rom is not None:
                _added_rom = refreshed_rom
        scan_target = db_rom_handler.get_rom(_added_rom.id)
        if scan_target is not None:
            for component in scan_target.components:
                await _enrich_pc_dlc_from_igdb(scan_target, component)

    # Short circuit if the scan type is hashes
    if scan_type == ScanType.HASHES or metadata_only:
        from handler.scan_operation_checkpoint import record_completed_game

        record_completed_game(_added_rom)
        return

    try:
        await publish_rom_resources(
            fs_resource_handler,
            _added_rom,
            rom,
            complete=scan_type == ScanType.COMPLETE,
        )
    except (ValueError, OSError, TransportError, DecodingError) as error:
        log.warning(
            "Scan resource replacement retained prior references (%s)",
            type(error).__name__,
        )
    _added_rom = db_rom_handler.get_rom(_added_rom.id)
    if _added_rom is None:
        raise ValueError("Scan catalog target disappeared")
    media_expected_version = _added_rom.updated_at
    # Keep the legacy resource paths for compatibility, but also reconcile
    # provider images into the canonical owned-media catalog used by the v2
    # media surfaces. Without this bridge a normal scan downloads screenshots
    # successfully while the new UI sees an empty owned_media collection.
    if _added_rom.url_cover or _added_rom.url_screenshots:
        try:
            refreshed_rom, media_failures = await refresh_provider_owned_media(
                _added_rom,
                media_expected_version,
                metadata_sources[0] if metadata_sources else "provider",
            )
            _added_rom = refreshed_rom
            for failure in media_failures:
                log.warning(
                    "Provider media item failed for ROM %s (%s/%s): %s",
                    _added_rom.id,
                    failure.role.value,
                    failure.provider_media_id,
                    failure.reason,
                )
        except (ValueError, OSError, TransportError, DecodingError) as exc:
            log.warning(
                "Provider media catalog refresh failed for ROM %s: %s",
                _added_rom.id,
                exc,
            )

    pending = getattr(scanned_rom, "_pending_scan_media", {})
    for source, field in (
        (MetadataSource.SS, "ss_metadata"),
        (MetadataSource.GAMELIST, "gamelist_metadata"),
        (MetadataSource.LAUNCHBOX, "launchbox_metadata"),
    ):
        if source not in metadata_sources:
            continue
        desired = pending.get(field, {})
        for media_type in get_preferred_media_types():
            key = f"{media_type.value}_path"
            path, url = desired.get(key), desired.get(f"{media_type.value}_url")
            if not path or not url:
                continue
            try:
                with ScanMediaBatch(
                    _added_rom.id, platform.id, fs_resource_handler.storage
                ) as unit:
                    generated = await fs_resource_handler.store_media_file(
                        add_ss_auth_to_url(url), path
                    )

                    def associate_special(
                        session, field=field, key=key, generated=generated
                    ):
                        current = db_rom_handler.get_rom(_added_rom.id, session=session)
                        metadata = dict(getattr(current, field) or {})
                        metadata[key] = generated
                        return db_rom_handler.update_rom(
                            current.id, {field: metadata}, session=session
                        )

                    unit.publish_and_associate(associate_special)
            except (ValueError, OSError, TransportError, DecodingError) as error:
                log.warning(
                    "Scan special media retained prior reference (%s)",
                    type(error).__name__,
                )

    if MetadataSource.RA in metadata_sources and "achievements" in pending.get(
        "ra_metadata", {}
    ):
        from copy import deepcopy

        try:
            achievements = deepcopy(pending["ra_metadata"]["achievements"])
            output_limit = sum(
                bool(item.get("badge_url" + suffix) and item.get("badge_path" + suffix))
                for item in achievements
                for suffix in ("", "_lock")
            )
            with ScanMediaInventory(
                _added_rom.id,
                platform.id,
                fs_resource_handler.storage,
                output_limit=output_limit,
            ) as unit:
                for achievement in achievements:
                    for suffix in ("", "_lock"):
                        url, path = achievement.get(
                            "badge_url" + suffix
                        ), achievement.get("badge_path" + suffix)
                        if url and path:
                            achievement["badge_path" + suffix] = (
                                await fs_resource_handler.store_ra_badge(url, path)
                            )

                def associate_badges(session):
                    current = db_rom_handler.get_rom(_added_rom.id, session=session)
                    metadata = deepcopy(current.ra_metadata or {})
                    metadata["achievements"] = achievements
                    return db_rom_handler.update_rom(
                        current.id, {"ra_metadata": metadata}, session=session
                    )

                unit.publish_and_associate(associate_badges)
        except (ValueError, OSError, TransportError, DecodingError) as error:
            log.warning(
                "Scan badges retained prior references (%s)", type(error).__name__
            )
    await _emit_scanning_rom(socket_manager, _added_rom)

    from handler.scan_operation_checkpoint import record_completed_game
    from handler.scan_pc_automation_observation import observe_pc_automation

    await observe_pc_automation(
        process_pc_automation_after_scan,
        platform,
        scanned_rom,
        _added_rom,
        newly_added,
        selected=MetadataSource.STEAM in metadata_sources,
        completed=record_completed_game,
    )

from __future__ import annotations

import asyncio
from itertools import batched

import socketio  # type: ignore

from config import SCAN_WORKERS
from endpoints.responses.platform import PlatformSchema
from endpoints.sockets.scan_decisions import _identify_firmware, should_scan_rom
from endpoints.sockets.scan_media import _emit_scanning_rom
from endpoints.sockets.scan_rom_identification import _identify_rom
from endpoints.sockets.scan_runtime import STOP_SCAN_FLAG, ScanStats
from exceptions.fs_exceptions import FirmwareNotFoundException, RomsNotFoundException
from exceptions.socket_exceptions import ScanStoppedException
from handler.database import db_firmware_handler, db_platform_handler, db_rom_handler
from handler.filesystem import fs_firmware_handler, get_fs_rom_handler
from handler.filesystem.roms_handler import FSRom
from handler.metadata import meta_gamelist_handler
from handler.metadata.ss_handler import log_quota as log_ss_quota
from handler.redis_handler import redis_client
from handler.scan_handler import MetadataSource, ScanType, scan_platform
from logger.formatter import BLUE, LIGHTYELLOW
from logger.formatter import highlight as hl
from logger.logger import log
from models.rom import Rom
from utils import emoji


async def _identify_platform(
    platform_slug: str,
    scan_type: ScanType,
    fs_platforms: list[str],
    roms_ids: list[int],
    metadata_sources: list[str],
    launchbox_remote_enabled: bool,
    playmatch_enabled: bool,
    socket_manager: socketio.AsyncRedisManager,
    scan_stats: ScanStats,
    metadata_locale: str | None = None,
    metadata_only: bool = False,
    filesystem_scope_path: str | None = None,
) -> ScanStats:
    # Stop the scan if the flag is set
    if redis_client.get(STOP_SCAN_FLAG):
        raise ScanStoppedException()

    platform = db_platform_handler.get_platform_by_fs_slug(platform_slug)
    if platform and scan_type == ScanType.NEW_PLATFORMS:
        return scan_stats

    scanned_platform = await scan_platform(platform_slug, fs_platforms)
    if platform:
        scanned_platform.id = platform.id

    await scan_stats.increment(
        socket_manager=socket_manager,
        scanned_platforms=1,
        new_platforms=1 if not platform else 0,
        identified_platforms=1 if scanned_platform.is_identified else 0,
    )

    platform = db_platform_handler.add_platform(scanned_platform)

    from handler.scan_operation_worker import persist_active_platform

    persist_active_platform(platform)

    # Preparse the platform's gamelist.xml file and cache it
    if MetadataSource.GAMELIST in metadata_sources:
        await meta_gamelist_handler.populate_cache(platform)

    # Scanning firmware
    try:
        fs_firmware = await fs_firmware_handler.get_firmware(platform.fs_slug)
    except FirmwareNotFoundException:
        fs_firmware = []

    if len(fs_firmware) == 0:
        log.warning(
            f"{hl(emoji.EMOJI_WARNING, color=LIGHTYELLOW)} No firmware found for {hl(platform.custom_name or platform.name, color=BLUE)}[{hl(platform.fs_slug)}]"
        )
    else:
        log.info(f"{hl(str(len(fs_firmware)))} firmware files found")

    new_firmware = 0
    for fs_fw in fs_firmware:
        new_firmware += await _identify_firmware(
            platform=platform,
            fs_fw=fs_fw,
        )

    # `new_firmware_count` is scoped to this scan: the client reports what the
    # scan discovered, not the platform's total firmware library.
    await socket_manager.emit(
        "scan:scanning_platform",
        {
            **PlatformSchema.model_validate(platform).model_dump(
                include={
                    "id",
                    "name",
                    "display_name",
                    "slug",
                    "fs_slug",
                    "is_identified",
                }
            ),
            "new_firmware_count": new_firmware,
        },
    )

    # This reduces the number of socket emissions
    await scan_stats.increment(
        socket_manager=socket_manager,
        scanned_firmware=len(fs_firmware),
        new_firmware=new_firmware,
    )

    try:
        fs_roms = await get_fs_rom_handler().get_roms(platform)
    except RomsNotFoundException as e:
        log.error(e)
        return scan_stats

    from handler.scan_collection_discovery import (
        collection_inventory,
        filesystem_identity,
        identify_collection_game,
    )

    fs_roms, classified_inventory = collection_inventory(
        platform, fs_roms, filesystem_scope_path
    )

    if len(fs_roms) == 0:
        log.warning(
            f"{hl(emoji.EMOJI_WARNING, color=LIGHTYELLOW)} No roms found, verify that the folder structure is correct"
        )
    else:
        log.info(f"{hl(str(len(fs_roms)))} roms found in the file system")

    # Snapshot the missing entries before the sync below clears the flag for any
    # whose file is back, so the skip path can still tell the client about them.
    previously_missing_rom_ids = db_rom_handler.get_missing_rom_ids(platform.id)

    # Flag entries whose file is gone before identifying files, so a renamed or
    # moved ROM (a new file with no fs_name match) can be reassociated by hash
    # with its now-missing entry instead of spawning a duplicate. The end-of-scan
    # call below re-syncs and logs, unmarking any entry that got reassociated.
    fs_rom_names = [rom["fs_name"] for rom in fs_roms]
    if filesystem_scope_path is None:
        from handler.scan_known_paths import present_known_nested_roms

        known_nested = present_known_nested_roms(
            get_fs_rom_handler(),
            platform.fs_slug,
            db_rom_handler.get_rom_filesystem_paths(platform.id),
        )
        fs_rom_names.extend(rom.fs_name for rom in known_nested)
        identities = {
            filesystem_identity(get_fs_rom_handler(), platform, entry)
            for entry in fs_roms
        }
        identities.update((rom.fs_path, rom.fs_name) for rom in known_nested)
        missing_options = (
            {"filesystem_identities": identities} if classified_inventory else {}
        )
        db_rom_handler.mark_missing_roms(platform.id, fs_rom_names, **missing_options)

    from handler.scan_inventory_contracts import QuickScanDecision
    from handler.scan_inventory_status import emit_inventory_status
    from handler.windows_quick_execution import (
        WindowsQuickContext,
        bind_windows_quick,
        inspect_discovered_game,
    )

    quick_contexts: dict[int, WindowsQuickContext] = {}
    # Create semaphore to limit concurrent ROM scanning
    scan_semaphore = asyncio.Semaphore(SCAN_WORKERS)

    async def scan_rom_with_semaphore(fs_rom: FSRom, rom: Rom | None) -> None:
        """Scan a single ROM with semaphore limiting"""
        async with scan_semaphore:
            with bind_windows_quick(quick_contexts.get(id(fs_rom))):
                await identify_collection_game(
                    fs_rom,
                    _identify_rom,
                    platform=platform,
                    rom=rom,
                    scan_type=scan_type,
                    roms_ids=roms_ids,
                    metadata_sources=metadata_sources,
                    launchbox_remote_enabled=launchbox_remote_enabled,
                    playmatch_enabled=playmatch_enabled,
                    metadata_locale=metadata_locale,
                    metadata_only=metadata_only,
                    socket_manager=socket_manager,
                    scan_stats=scan_stats,
                )
                quick = quick_contexts.get(id(fs_rom))
                if quick is not None and quick.binding is not None:
                    completed = db_rom_handler.get_rom(quick.binding.rom_id)
                    if completed is not None:
                        await emit_inventory_status(
                            socket_manager,
                            quick,
                            completed,
                            existing_game=rom is not None,
                        )

    for fs_roms_batch in batched(fs_roms, 200, strict=False):
        roms_by_fs_name = db_rom_handler.get_roms_by_fs_name(
            platform_id=platform.id,
            fs_names={fs_rom["fs_name"] for fs_rom in fs_roms_batch},
        )

        collection_roms = (
            db_rom_handler.get_roms_by_filesystem_identity(
                platform.id,
                {
                    filesystem_identity(get_fs_rom_handler(), platform, entry)
                    for entry in fs_roms_batch
                },
            )
            if classified_inventory
            else {}
        )

        # Separate skipped ROMs from those that need scanning
        skipped_rom_ids: list[int] = []
        restored_roms: list[Rom] = []
        roms_to_scan: list[tuple[FSRom, Rom | None]] = []

        for fs_rom in fs_roms_batch:
            rom = (
                collection_roms.get(
                    filesystem_identity(get_fs_rom_handler(), platform, fs_rom)
                )
                if classified_inventory
                else roms_by_fs_name.get(fs_rom["fs_name"])
            )
            quick = await inspect_discovered_game(
                platform,
                fs_rom,
                rom,
                scan_type=scan_type.value,
                rom_ids=roms_ids,
                metadata_only=metadata_only,
            )
            if quick is not None:
                quick_contexts[id(fs_rom)] = quick
                if rom is not None:
                    await emit_inventory_status(
                        socket_manager, quick, rom, existing_game=True
                    )
                if quick.decision == QuickScanDecision.INCOMPLETE:
                    from handler.filesystem.pc_scan_inventory import InventoryIncomplete

                    raise InventoryIncomplete(
                        quick.before.reason or "incomplete_evidence"
                    )
                if quick.decision in {
                    QuickScanDecision.REUSE,
                    QuickScanDecision.METADATA_ONLY,
                }:
                    assert rom is not None
                    skipped_rom_ids.append(rom.id)
                    continue
            if quick is not None or should_scan_rom(
                scan_type=scan_type,
                rom=rom,
                roms_ids=roms_ids,
                metadata_sources=metadata_sources,
                fs_rom=fs_rom,
            ):
                roms_to_scan.append((fs_rom, rom))
            elif rom:
                from handler.scan_pc_automation_observation import (
                    consider_scan_descriptions,
                )

                consider_scan_descriptions(rom)
                from handler.scan_operation_checkpoint import record_checked_game

                record_checked_game(rom, outcome="skipped")
                skipped_rom_ids.append(rom.id)
                if rom.id in previously_missing_rom_ids:
                    restored_roms.append(rom)

        # Bulk update all skipped ROMs in one query instead of per-ROM updates
        if skipped_rom_ids:
            db_rom_handler.bulk_mark_present(platform.id, skipped_rom_ids)
            await scan_stats.increment(
                socket_manager=socket_manager,
                scanned_roms=len(skipped_rom_ids),
            )

        # Skipped ROMs emit nothing, so a ROM whose file came back would keep its
        # stale "missing" badge in an open gallery until a refetch. Reload with
        # details since the scan-loop lookup only eager-loads the platform.
        for restored_rom in restored_roms:
            log.info(
                f"{hl(restored_rom.fs_name)} is back in the filesystem, "
                f"no longer {hl('missing', color=LIGHTYELLOW)}"
            )
            hydrated_rom = db_rom_handler.get_rom(restored_rom.id)
            if hydrated_rom is None:
                continue

            await _emit_scanning_rom(socket_manager, hydrated_rom)

        # Process only ROMs that actually need scanning
        scan_tasks = [
            scan_rom_with_semaphore(fs_rom=fs_rom, rom=rom)
            for fs_rom, rom in roms_to_scan
        ]

        if scan_tasks:
            batched_results = await asyncio.gather(*scan_tasks, return_exceptions=True)
            for result, (_fs_rom, _) in zip(
                batched_results, roms_to_scan, strict=False
            ):
                if isinstance(result, BaseException):
                    raise result
        quick_contexts.clear()

    missing_roms = (
        db_rom_handler.mark_missing_roms(platform.id, fs_rom_names, **missing_options)
        if filesystem_scope_path is None
        else []
    )
    if len(missing_roms) > 0:
        log.warning(f"{hl('Missing')} roms from filesystem:")
        for r in missing_roms:
            log.warning(f" - {r.fs_name}")

    missing_firmware = db_firmware_handler.mark_missing_firmware(
        platform.id, [fw for fw in fs_firmware]
    )
    if len(missing_firmware) > 0:
        log.warning(f"{hl('Missing')} firmware from filesystem:")
        for f in missing_firmware:
            log.warning(f" - {f}")

    if MetadataSource.SS in metadata_sources:
        log_ss_quota()

    return scan_stats

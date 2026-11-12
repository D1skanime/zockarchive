from __future__ import annotations

from typing import cast

from endpoints.sockets.scan_platform_execution import scan_platforms
from endpoints.sockets.scan_runtime import ScanStats
from exceptions.storage_exceptions import (
    MissingPlatformStorageMappingError,
    StorageResolutionError,
)
from handler.database import db_platform_handler, db_storage_handler
from handler.filesystem import fs_platform_handler, fs_rom_handler, use_fs_rom_handler
from handler.filesystem.storage_resolver import get_storage_root_health_snapshot
from handler.scan_command import MappedScanCommand, ScanScope, ScanTrigger
from handler.scan_handler import MappedScanCommand as HandlerMappedScanCommand
from handler.scan_handler import ScanType, execute_mapped_scan
from handler.setup_recovery import setup_recovery_handler
from logger.logger import log


async def execute_mapping_scan(
    command: MappedScanCommand,
    *,
    metadata_sources: list[str],
    scan_type: ScanType = ScanType.QUICK,
    roms_ids: list[int] | None = None,
    launchbox_remote_enabled: bool = True,
    playmatch_enabled: bool = True,
    metadata_locale: str | None = None,
    metadata_only: bool = False,
    media_only: bool = False,
) -> ScanStats:
    """Run a scan from immutable mapping identity, never a caller-supplied path."""
    mapping = db_storage_handler.get_mapping(command.mapping_id)
    scope_path = dict(command.options).get("relative_path")

    async def _scan_batch(
        _command: MappedScanCommand, _entries: list[str], _context: object
    ) -> ScanStats:
        scoped_handler = fs_rom_handler.for_mapping(mapping, scope_path)
        with use_fs_rom_handler(scoped_handler):
            return await scan_platforms(
                platform_ids=[mapping.platform_id],
                metadata_sources=metadata_sources,
                scan_type=ScanType(command.scan_type),
                roms_ids=roms_ids,
                launchbox_remote_enabled=launchbox_remote_enabled,
                playmatch_enabled=playmatch_enabled,
                metadata_locale=metadata_locale,
                metadata_only=metadata_only,
                media_only=media_only,
                filesystem_platform_scope=[mapping.platform.fs_slug],
                filesystem_scope_path=scope_path,
            )

    return await execute_mapped_scan(
        cast(HandlerMappedScanCommand, command),
        _scan_batch,
    )


def mapping_scan_commands(
    platform_ids: list[int],
    *,
    trigger: ScanTrigger,
    scope: ScanScope,
    scan_type: ScanType,
    platform_fs_slugs: list[str] | None = None,
    filesystem_scope_paths: dict[str, str] | None = None,
) -> list[MappedScanCommand]:
    """Freeze the active mapping revision for each selected platform."""
    platforms = db_platform_handler.get_platforms()
    selected_fs_slugs = set(platform_fs_slugs or [])
    selected = (
        [platform for platform in platforms if platform.id in platform_ids]
        if platform_ids
        else [
            platform
            for platform in platforms
            if not selected_fs_slugs or platform.fs_slug in selected_fs_slugs
        ]
    )
    commands = []
    for platform in selected:
        try:
            mappings = db_storage_handler.list_active_mappings(platform.id)
        except (MissingPlatformStorageMappingError, StorageResolutionError):
            continue
        for mapping in mappings:
            health = get_storage_root_health_snapshot(mapping.storage_root)
            if health.non_writable is not True:
                log.info(
                    "Skipping writable or unhealthy mapping for platform %s",
                    platform.fs_slug,
                )
                continue
            options: tuple[tuple[str, str], ...] = ()
            scope_path = (filesystem_scope_paths or {}).get(platform.fs_slug)
            if scope_path:
                options = (("relative_path", scope_path),)
            commands.append(
                MappedScanCommand(
                    mapping_id=mapping.id,
                    expected_revision=mapping.version,
                    trigger=trigger,
                    scope=scope,
                    scan_type=scan_type.value,
                    options=options,
                )
            )
    return commands


async def execute_mapping_scans(
    commands: list[MappedScanCommand],
    *,
    metadata_sources: list[str],
    roms_ids: list[int] | None = None,
    launchbox_remote_enabled: bool = True,
    playmatch_enabled: bool = True,
    metadata_locale: str | None = None,
    metadata_only: bool = False,
    media_only: bool = False,
) -> ScanStats:
    """Execute mapping commands through the common executor."""
    combined = ScanStats()
    for command in commands:
        result = await execute_mapping_scan(
            command,
            metadata_sources=metadata_sources,
            roms_ids=roms_ids,
            launchbox_remote_enabled=launchbox_remote_enabled,
            playmatch_enabled=playmatch_enabled,
            metadata_locale=metadata_locale,
            metadata_only=metadata_only,
            media_only=media_only,
        )
        for field in result.to_dict():
            setattr(combined, field, getattr(combined, field) + getattr(result, field))
    return combined


async def execute_mixed_scans(
    commands: list[MappedScanCommand],
    *,
    platform_ids: list[int],
    platform_fs_slugs: list[str],
    metadata_sources: list[str],
    scan_type: ScanType = ScanType.QUICK,
    roms_ids: list[int] | None = None,
    launchbox_remote_enabled: bool = True,
    playmatch_enabled: bool = True,
    metadata_locale: str | None = None,
    metadata_only: bool = False,
    media_only: bool = False,
) -> ScanStats:
    """Run protected PC mappings and writable legacy platforms exactly once."""
    combined = ScanStats()
    if commands:
        mapped_result = await execute_mapping_scans(
            commands,
            metadata_sources=metadata_sources,
            roms_ids=roms_ids,
            launchbox_remote_enabled=launchbox_remote_enabled,
            playmatch_enabled=playmatch_enabled,
            metadata_locale=metadata_locale,
            metadata_only=metadata_only,
            media_only=media_only,
        )
        for field in mapped_result.to_dict():
            setattr(
                combined,
                field,
                getattr(combined, field) + getattr(mapped_result, field),
            )

    mapped_platform_ids = {
        db_storage_handler.get_mapping(command.mapping_id).platform_id
        for command in commands
    }
    mapped_fs_slugs = {
        platform.fs_slug
        for platform in db_platform_handler.get_platforms()
        if platform.id in mapped_platform_ids
    }
    legacy_ids = [
        platform_id
        for platform_id in platform_ids
        if platform_id not in mapped_platform_ids
    ]
    if platform_ids or platform_fs_slugs:
        legacy_fs_slugs = [
            slug for slug in platform_fs_slugs if slug not in mapped_fs_slugs
        ]
    else:
        all_fs_slugs = await fs_platform_handler.get_platforms()
        excluded_paths = setup_recovery_handler.excluded_folder_paths()
        legacy_fs_slugs = [
            slug
            for slug in all_fs_slugs
            if slug not in mapped_fs_slugs and slug not in excluded_paths
        ]

    if (
        legacy_ids
        or legacy_fs_slugs
        or (not platform_ids and not platform_fs_slugs and not mapped_platform_ids)
    ):
        legacy_result = await scan_platforms(
            platform_ids=legacy_ids,
            metadata_sources=metadata_sources,
            scan_type=scan_type,
            roms_ids=roms_ids,
            launchbox_remote_enabled=launchbox_remote_enabled,
            playmatch_enabled=playmatch_enabled,
            platform_fs_slugs=legacy_fs_slugs,
            metadata_locale=metadata_locale,
            metadata_only=metadata_only,
            media_only=media_only,
        )
        for field in legacy_result.to_dict():
            setattr(
                combined,
                field,
                getattr(combined, field) + getattr(legacy_result, field),
            )
    return combined

"""Folder-download reconciliation at the authorized shared-download boundary."""

import asyncio

from exceptions.storage_read import MappedReadError
from handler.database import db_rom_handler
from handler.filesystem import get_fs_rom_handler
from handler.filesystem.folder_download import build_shared_download_component
from handler.filesystem.pc_scan_inventory import InventoryIncomplete
from handler.filesystem.scan_media_publication import ScanMediaBatch
from logger.logger import log
from models.rom import Rom, RomComponentKind

LOGGER_MODULE_NAME = {"module_name": "scan"}


async def reconcile_shared_download_inventory(rom: Rom, resource_storage) -> None:
    """Replace manifest membership only after its source inventory is verified."""
    try:
        folder_component = await build_shared_download_component(
            get_fs_rom_handler(), rom
        )
    except (InventoryIncomplete, MappedReadError, OSError, ValueError) as exc:
        log.warning(
            "Folder download inventory unavailable for %s: %s",
            rom.fs_name,
            exc,
            extra=LOGGER_MODULE_NAME,
        )
        folder_component = None
    with ScanMediaBatch(rom.id, rom.platform_id, resource_storage) as unit:
        unit.publish_and_associate(
            lambda session: db_rom_handler.sync_rom_components(
                rom.id,
                [folder_component] if folder_component is not None else [],
                session=session,
            )
        )


async def ensure_shared_download_inventory(rom: Rom) -> None:
    """Materialize qualified source membership before a shared manifest is requested."""
    folder_components = [
        component
        for component in rom.components
        if component.kind is RomComponentKind.FOLDER
    ]
    if (
        len(folder_components) == 1
        and folder_components[0].manifest_members
        and not any(
            member.missing_from_fs for member in folder_components[0].manifest_members
        )
    ):
        return
    try:
        folder_component = await build_shared_download_component(
            get_fs_rom_handler(), rom
        )
    except (InventoryIncomplete, MappedReadError, OSError, ValueError) as exc:
        raise ValueError("manifest folder inventory is unavailable") from exc
    retained_components = [
        component
        for component in rom.components
        if component.kind is not RomComponentKind.FOLDER
    ]
    await asyncio.to_thread(
        db_rom_handler.sync_rom_components,
        rom.id,
        [*retained_components, folder_component],
    )

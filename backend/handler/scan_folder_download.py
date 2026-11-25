"""Folder-download reconciliation at the authorized shared-download boundary."""

from exceptions.storage_read import MappedReadError
from handler.database import db_rom_handler
from handler.filesystem import get_fs_rom_handler
from handler.filesystem.folder_download import build_shared_download_component
from handler.filesystem.pc_scan_inventory import InventoryIncomplete
from handler.filesystem.scan_media_publication import ScanMediaBatch
from logger.logger import log
from models.rom import Rom, RomComponentKind

LOGGER_MODULE_NAME = {"module_name": "scan"}

# Retain the established import and monkeypatch seam while all folder sources
# share one platform-neutral implementation.
build_ps3_download_component = build_shared_download_component


async def reconcile_shared_download_inventory(rom: Rom, resource_storage) -> None:
    """Replace manifest membership only after its source inventory is verified."""
    try:
        folder_component = await build_ps3_download_component(get_fs_rom_handler(), rom)
    except (InventoryIncomplete, MappedReadError, OSError, ValueError) as exc:
        log.warning(
            "Folder download inventory unavailable for %s: %s",
            rom.fs_name,
            exc,
            extra=LOGGER_MODULE_NAME,
        )
        folder_component = None
    retained_components = [
        component
        for component in rom.components
        if component.kind is not RomComponentKind.FOLDER
    ]
    scanned_components = (
        [*retained_components, folder_component]
        if folder_component is not None
        else retained_components
    )
    with ScanMediaBatch(rom.id, rom.platform_id, resource_storage) as unit:
        unit.publish_and_associate(
            lambda session: db_rom_handler.sync_rom_components(
                rom.id,
                scanned_components,
                session=session,
            )
        )


async def ensure_shared_download_inventory(rom: Rom) -> None:
    """Accept only complete inventory published by the authorized scan lifecycle."""
    folder_components = [
        component
        for component in rom.components
        if component.kind is RomComponentKind.FOLDER
    ]
    if len(folder_components) != 1 or not folder_components[0].manifest_members:
        raise ValueError("manifest folder inventory is unavailable")
    if any(member.missing_from_fs for member in folder_components[0].manifest_members):
        raise ValueError("manifest folder inventory is unavailable")


# Keep existing consumers patchable without reviving PS3-only resolver logic.
ensure_ps3_download_inventory = ensure_shared_download_inventory

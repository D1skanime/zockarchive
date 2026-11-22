"""Folder-download reconciliation performed during PS3 library scans."""

from exceptions.storage_read import MappedReadError
from handler.database import db_rom_handler
from handler.filesystem import get_fs_rom_handler
from handler.filesystem.pc_scan_inventory import InventoryIncomplete
from handler.filesystem.scan_media_publication import ScanMediaBatch
from logger.logger import log
from models.rom import Rom

LOGGER_MODULE_NAME = {"module_name": "scan"}


async def reconcile_ps3_folder_download(rom: Rom, resource_storage) -> None:
    """Replace stale PS3 membership when inventory cannot prove every source file."""
    try:
        folder_component = await get_fs_rom_handler().get_folder_download_component(rom)
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

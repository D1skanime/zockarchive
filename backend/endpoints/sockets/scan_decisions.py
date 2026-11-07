from endpoints.sockets.scan_runtime import STOP_SCAN_FLAG
from handler.database import db_firmware_handler
from handler.database.scan_write_fence import require_scan_write_context
from handler.filesystem.roms_handler import FSRom
from handler.metadata.base_handler import UniversalPlatformSlug as UPS
from handler.metadata.steam_handler import STEAM_PLATFORMS
from handler.redis_handler import redis_client
from handler.scan_handler import MetadataSource, ScanType, scan_firmware
from models.firmware import Firmware
from models.platform import Platform
from models.rom import Rom


async def _identify_firmware(
    platform: Platform,
    fs_fw: str,
) -> int:
    require_scan_write_context()
    from handler.scan_operation_worker import check_worker_boundary

    check_worker_boundary()
    # Break early if the flag is set
    if redis_client.get(STOP_SCAN_FLAG):
        return 0

    firmware = db_firmware_handler.get_firmware_by_filename(platform.id, fs_fw)

    scanned_firmware = await scan_firmware(
        platform=platform,
        file_name=fs_fw,
        firmware=firmware,
    )

    is_verified = Firmware.verify_file_hashes(
        platform_slug=platform.slug,
        file_name=fs_fw,
        file_size_bytes=scanned_firmware.file_size_bytes,
        md5_hash=scanned_firmware.md5_hash,
        sha1_hash=scanned_firmware.sha1_hash,
        crc_hash=scanned_firmware.crc_hash,
    )

    scanned_firmware.missing_from_fs = False
    scanned_firmware.is_verified = is_verified
    db_firmware_handler.add_firmware(scanned_firmware)

    return 1 if not firmware else 0


def should_scan_rom(
    scan_type: ScanType,
    rom: Rom | None,
    roms_ids: list[int],
    metadata_sources: list[str],
    fs_rom: FSRom | None = None,
) -> bool:
    """Decide if a rom should be scanned or not

    Args:
        scan_type (ScanType): Type of scan to be performed.
        rom (Rom | None): The rom to be scanned.
        roms_ids (list[int]): List of selected roms to be scanned.
        metadata_sources (list[str]): List of metadata sources to be used.
        fs_rom (FSRom | None): Current filesystem scan-entry shape.
    """

    # When roms_ids is provided, the scan is scoped to those roms only
    if roms_ids:
        return bool(rom and rom.id in roms_ids)

    # This logic is tricky so only touch it if you know what you're doing"""
    should_scan = bool(
        # Any new roms should be scanned
        (scan_type in {ScanType.NEW_PLATFORMS, ScanType.QUICK} and not rom)
        # Complete rescan should scan all roms
        or (scan_type == ScanType.COMPLETE)
        # Hashes rescan should scan all roms to update the hashes
        or (scan_type == ScanType.HASHES)
        or (
            rom
            and (
                # Existing directory-backed Windows games refresh their PC
                # component manifests during unscoped quick scans.
                (
                    scan_type == ScanType.QUICK
                    and rom.platform_slug == UPS.WIN
                    and fs_rom is not None
                    and fs_rom["nested"] is True
                )
                # Update scan should scan ROMs identified by the selected metadata sources
                or (
                    scan_type == ScanType.UPDATE
                    and rom.is_identified
                    and any(
                        getattr(rom, f"{source}_id", None)
                        for source in metadata_sources
                    )
                )
                or (
                    scan_type == ScanType.UPDATE
                    and rom.platform_slug == UPS.WIN
                    and rom.steam_id is not None
                    and rom.steam_id > 0
                    and not rom.igdb_id
                    and MetadataSource.IGDB in metadata_sources
                )
                or (
                    # D-03/T-21-10: Steam-only UPDATE parity is limited to
                    # supported PC platforms with a persisted Steam identity.
                    scan_type == ScanType.UPDATE
                    and rom.platform_slug in STEAM_PLATFORMS
                    and isinstance(rom.steam_id, int)
                    and not isinstance(rom.steam_id, bool)
                    and rom.steam_id > 0
                    and MetadataSource.STEAM in metadata_sources
                )
                # Unmatched scan is reserved for ROMs with no metadata
                # identity at all. Provider-specific refreshes belong to UPDATE.
                or (scan_type == ScanType.UNMATCHED and rom.is_unidentified)
            )
        )
    )

    return should_scan


def _should_get_rom_files(
    scan_type: ScanType,
    rom: Rom,
    newly_added: bool,
    roms_ids: list[int],
) -> bool:
    """Decide if the files of a rom should be rebuilt or not

    Args:
        scan_type (ScanType): Type of scan to be performed.
        rom (Rom): The rom to be rebuilt.
        newly_added (bool): Whether the rom is newly added.
        roms_ids (list[int]): List of selected roms to be scanned.
    """

    return bool(
        newly_added
        or (scan_type == ScanType.COMPLETE)
        or (scan_type == ScanType.HASHES)
        or (rom and rom.id in roms_ids)
    )


# There's an order of operations here that is important:
# 1. Read the list of roms from the filesystem
# 2. Check if ROM should be scanned based on the scan type
# 3. Create a new ROM entry if it doesn't exist
# 4. Build the ROM files and calculate the hashes
# 4. Scan the ROM and update its metadata

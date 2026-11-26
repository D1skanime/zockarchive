"""Resolve manifest reads through the current mapped storage boundary."""

from pathlib import PurePosixPath

from exceptions.storage_exceptions import MissingPlatformStorageMappingError
from models.rom import Rom


def filesystem_for_manifest_rom(rom: Rom):
    """Return the mapping-scoped reader, or the legacy reader when unmapped."""
    from handler.database import db_storage_handler
    from handler.filesystem import fs_rom_handler
    from handler.filesystem.roms_handler import FSRomsHandler
    from handler.filesystem.storage_resolver import normalize_relative_path
    from handler.storage.read_context import MappingReadContext

    try:
        mapping = db_storage_handler.path_mapping(rom.platform_id, rom.full_path)
    except MissingPlatformStorageMappingError:
        return fs_rom_handler
    MappingReadContext(mapping.id, mapping.version).validate()
    try:
        relative_path = PurePosixPath(rom.full_path).relative_to(
            PurePosixPath(mapping.relative_path)
        )
    except ValueError as error:
        raise ValueError("manifest folder inventory is unavailable") from error
    return FSRomsHandler.for_mapping(
        mapping, normalize_relative_path(relative_path.as_posix())
    )

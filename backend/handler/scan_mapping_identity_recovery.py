"""Reconnect one missing catalog game after an explicit mapping-path change."""

from pathlib import PurePosixPath

from sqlalchemy import select

from decorators.database import begin_session
from handler.database import db_rom_handler
from handler.scan_operation_checkpoint import current_checkpoint_command
from handler.storage.read_context import MappingReadContext
from models.rom import Rom
from models.storage import PlatformStorageMapping


def _relative_to(path: str, root: str) -> PurePosixPath | None:
    try:
        return PurePosixPath(path).relative_to(PurePosixPath(root))
    except ValueError:
        return None


@begin_session
def _matches_inactive_mapping(rom, mapping, target_path, *, session=None) -> bool:
    """Require the same root and relative game identity before a rebind."""
    target = _relative_to(f"{target_path}/{rom.fs_name}", mapping.relative_path)
    if target is None:
        return False
    inactive = session.scalars(
        select(PlatformStorageMapping).where(
            PlatformStorageMapping.platform_id == mapping.platform_id,
            PlatformStorageMapping.storage_root_id == mapping.storage_root_id,
            PlatformStorageMapping.active.is_(False),
        )
    )
    legacy_path = f"{rom.fs_path}/{rom.fs_name}"
    return any(
        _relative_to(legacy_path, candidate.relative_path) == target
        for candidate in inactive
    )


def rebind_missing_mapping_identity(rom: Rom | None, entry) -> Rom | None:
    """Move one exact missing identity onto the active mapping before inventory.

    A direct-folder rename changes the logical prefix, but the catalog retains a
    platform-wide unique game name. Without this recovery, discovery sees the
    game under the new mapping, then cannot insert it because its missing legacy
    row still owns that name. The exact suffix and storage-root checks ensure
    that only a proven mapping transition keeps the existing game identity.
    """
    command = current_checkpoint_command()
    if rom is None or not rom.missing_from_fs or command is None:
        return None
    mapping = MappingReadContext(
        command.mapping_id, command.expected_revision
    ).validate()
    target_path = entry.get("logical_fs_path", mapping.relative_path)
    if not _matches_inactive_mapping(rom, mapping, target_path):
        return None
    return db_rom_handler.update_rom(
        rom.id, {"fs_path": target_path, "missing_from_fs": False}
    )


def mark_mapping_identity_rebound(entry):
    """Let the existing child-inventory path rebuild this recovered game."""
    entry["mapping_identity_rebound"] = True


def recover_mapping_identity(mapping_inventory, rom, legacy_rom, entry, fallback):
    """Resolve a missing mapped identity or retain the selected-child fallback."""
    if not mapping_inventory or rom is not None:
        return rom, False
    recovered = rebind_missing_mapping_identity(legacy_rom, entry)
    if recovered is not None:
        mark_mapping_identity_rebound(entry)
        return recovered, True
    return fallback(legacy_rom, entry), False

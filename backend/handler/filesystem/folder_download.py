"""Immutable manifest members for verified folder downloads."""

import asyncio
import os
from pathlib import PurePosixPath

from handler.filesystem.pc_scan_inventory import InventoryIncomplete
from handler.filesystem.storage_access import directory_signature
from handler.filesystem.storage_policy import StorageOperation
from handler.scan_inventory_contracts import InventoryEvidence
from models.rom import RomComponent, RomComponentKind, RomComponentManifestMember


async def build_folder_download_component(
    handler, rom, inventory: InventoryEvidence | None
) -> RomComponent:
    """Hash stable inventory entries into one neutral manifest component."""
    evidence = inventory or await handler.get_folder_inventory(rom)
    if not evidence.complete:
        raise InventoryIncomplete(evidence.reason or "incomplete_evidence")
    open_access = handler._pc_inventory_access
    rom_path = handler._pc_game_path(rom)
    members = tuple(entry for entry in evidence.observations if entry.kind == "file")
    if not members:
        raise InventoryIncomplete("empty_inventory")

    def build() -> RomComponent:
        from handler.scan_operation_worker import check_worker_boundary

        verified_members: list[RomComponentManifestMember] = []
        for entry in members:
            check_worker_boundary()
            path = PurePosixPath(entry.relative_path)
            if (
                not entry.relative_path
                or path.is_absolute()
                or ".." in path.parts
                or any(part in {"", "."} for part in path.parts)
            ):
                raise InventoryIncomplete("invalid_relative_path")
            with open_access(
                StorageOperation.HASH, f"{rom_path}/{entry.relative_path}"
            ) as source:
                before = os.fstat(source.fileno())
                if (
                    before.st_size,
                    before.st_mtime_ns,
                    before.st_ctime_ns,
                    before.st_dev,
                    before.st_ino,
                ) != (
                    entry.size,
                    entry.mtime_ns,
                    entry.ctime_ns,
                    entry.device,
                    entry.inode,
                ):
                    raise InventoryIncomplete("unstable_file")
                sha256 = source.hash("sha256")
                if directory_signature(before) != directory_signature(
                    os.fstat(source.fileno())
                ):
                    raise InventoryIncomplete("unstable_file")
            verified_members.append(
                RomComponentManifestMember(
                    relative_path=entry.relative_path,
                    size_bytes=entry.size,
                    sha256=sha256,
                )
            )
        return RomComponent(
            relative_path="folder-download",
            kind=RomComponentKind.FOLDER,
            manifest_members=verified_members,
        )

    return await asyncio.to_thread(build)

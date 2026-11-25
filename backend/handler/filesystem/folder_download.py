"""Immutable manifest members for verified folder downloads."""

import asyncio
import os
import stat
from pathlib import PurePosixPath

from handler.filesystem.pc_scan_inventory import InventoryIncomplete
from handler.filesystem.storage_access import directory_signature
from handler.filesystem.storage_policy import StorageOperation
from handler.scan_inventory_contracts import InventoryEvidence
from models.rom import Rom, RomComponent, RomComponentKind, RomComponentManifestMember

SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES = 4_000_000_000


def has_shared_download_single_file(rom: Rom) -> bool:
    """Recognize a direct legacy file even when scans persist its path as dot."""
    if rom.has_simple_single_file:
        return True
    return (
        len(rom.files) == 1
        and rom.files[0].file_name == rom.fs_name
        and rom.files[0].file_path == "."
    )


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


async def build_single_file_download_component(handler, rom: Rom) -> RomComponent:
    """Capture a verified single ROM file as the same neutral manifest group."""
    source_path = handler._pc_game_path(rom)

    def build() -> RomComponent:
        with handler._pc_inventory_access(StorageOperation.HASH, source_path) as source:
            before = os.fstat(source.fileno())
            if not stat.S_ISREG(before.st_mode):
                raise InventoryIncomplete("single_file_unavailable")
            sha256 = source.hash("sha256")
            if directory_signature(before) != directory_signature(
                os.fstat(source.fileno())
            ):
                raise InventoryIncomplete("unstable_file")
        return RomComponent(
            relative_path="single-file-download",
            kind=RomComponentKind.FOLDER,
            manifest_members=[
                RomComponentManifestMember(
                    relative_path="", size_bytes=before.st_size, sha256=sha256
                )
            ],
        )

    return await asyncio.to_thread(build)


async def build_shared_download_component(handler, rom: Rom) -> RomComponent:
    """Use one neutral group for an authorized directory or single-file source."""
    if has_shared_download_single_file(rom):
        return await build_single_file_download_component(handler, rom)
    return await build_folder_download_component(handler, rom, inventory=None)

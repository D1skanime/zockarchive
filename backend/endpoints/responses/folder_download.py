"""Server-owned eligibility for the shared large-game download flow."""

from typing import Literal

from pydantic import Field

from endpoints.responses.base import BaseModel
from handler.filesystem.folder_download import SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES
from handler.metadata.base_handler import UniversalPlatformSlug as UPS
from models.rom import Rom, RomComponentKind


class FolderDownloadCapabilitySchema(BaseModel):
    """Safe aggregate for a shared-download source with recorded size evidence."""

    source_kind: Literal["file", "folder"]
    member_count: int = Field(ge=1)
    total_size_bytes: int = Field(ge=0)


def prepare_download_components(rom: Rom) -> None:
    """Project only PC download components into schemas shared by list responses."""
    rom.download_components = [  # type: ignore[assignment]
        component
        for component in rom.components
        if component.kind is not RomComponentKind.FOLDER
    ]


def is_legacy_shared_download_platform(rom: Rom) -> bool:
    """Keep the accepted PC and PS3 manifest contract independent of new platforms."""
    return rom.platform_slug in {UPS.WIN, UPS.PS3}


def shared_download_capability(rom: Rom) -> FolderDownloadCapabilitySchema | None:
    """Return only persisted exact-size evidence safe for whole-source delivery.

    The response and manifest endpoint share this predicate so a client cannot
    turn a platform label, incomplete inventory, or inferred zero size into a
    download capability.
    """
    if rom.missing_from_fs:
        return None

    folder_components = [
        component
        for component in rom.components
        if component.kind is RomComponentKind.FOLDER
    ]
    if len(folder_components) != 1:
        return None

    folder_component = folder_components[0]
    members = folder_component.manifest_members
    total_size_bytes = sum(member.size_bytes for member in members)
    if (
        not members
        or any(
            member.missing_from_fs or member.size_bytes < 0 or len(member.sha256) != 64
            for member in members
        )
        or (
            not is_legacy_shared_download_platform(rom)
            and total_size_bytes < SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES
        )
    ):
        return None

    if rom.has_simple_single_file:
        if (
            len(rom.files) != 1
            or folder_component.relative_path != "single-file-download"
            or len(members) != 1
            or members[0].relative_path
        ):
            return None
        simple_file = rom.files[0]
        if (
            simple_file.missing_from_fs
            or simple_file.file_size_bytes != rom.fs_size_bytes
            or members[0].size_bytes != simple_file.file_size_bytes
        ):
            return None
        return FolderDownloadCapabilitySchema(
            source_kind="file",
            member_count=1,
            total_size_bytes=total_size_bytes,
        )

    return FolderDownloadCapabilitySchema(
        source_kind="folder",
        member_count=len(members),
        total_size_bytes=total_size_bytes,
    )


def is_shared_download_eligible(rom: Rom) -> bool:
    """Answer whether existing recorded facts authorize whole-source preparation."""
    return shared_download_capability(rom) is not None


def prepare_folder_download_details(rom: Rom) -> None:
    """Project the shared capability without exposing source paths or members."""
    prepare_download_components(rom)
    rom.folder_download = shared_download_capability(rom)  # type: ignore[assignment]

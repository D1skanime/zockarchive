"""Detail-response projection for verified folder download sources."""

from pydantic import Field

from endpoints.responses.base import BaseModel
from models.rom import Rom, RomComponentKind


class FolderDownloadCapabilitySchema(BaseModel):
    """Safe aggregate for a verified server-owned folder source."""

    member_count: int = Field(ge=1)
    total_size_bytes: int = Field(ge=0)


def prepare_folder_download_details(rom: Rom) -> None:
    """Expose an aggregate only when exactly one complete folder is verified."""
    folder_components = [
        component
        for component in rom.components
        if component.kind is RomComponentKind.FOLDER
    ]
    rom.download_components = [  # type: ignore[assignment]
        component
        for component in rom.components
        if component.kind is not RomComponentKind.FOLDER
    ]
    if len(folder_components) != 1:
        rom.folder_download = None  # type: ignore[assignment]
        return
    members = folder_components[0].manifest_members
    rom.folder_download = (  # type: ignore[assignment]
        FolderDownloadCapabilitySchema(
            member_count=len(members),
            total_size_bytes=sum(member.size_bytes for member in members),
        )
        if members and all(not member.missing_from_fs for member in members)
        else None
    )

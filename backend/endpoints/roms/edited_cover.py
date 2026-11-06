"""Prepare searched-cover edits for the standard ROM edit route."""

from dataclasses import dataclass, replace

from handler.database import db_rom_handler
from handler.filesystem import fs_resource_handler
from handler.filesystem.searched_cover import store_searched_cover
from handler.metadata.rom_media import ProviderMediaCandidate, discover_provider_media
from models.rom import Rom, RomOwnedMediaRole, RomOwnedMediaState


@dataclass(frozen=True)
class PreparedSearchedCover:
    candidate: ProviderMediaCandidate
    path: str
    mime_type: str
    new_file: bool


async def prepare_searched_cover(
    rom: Rom, source_url: str, fetch_url: str
) -> PreparedSearchedCover:
    """Reuse one retained candidate per URL or stage a new immutable resource."""
    candidate = discover_provider_media("cover-search", {"url_covers": [source_url]})[0]
    if db_rom_handler.get_provider_media_suppressions(rom.id, [candidate]):
        raise ValueError("This cover was explicitly deleted")
    existing = next(
        (
            item
            for item in rom.owned_media
            if item.role == RomOwnedMediaRole.COVER
            and item.state == RomOwnedMediaState.ACTIVE
            and item.provider
            and item.provider_media_id == candidate.provider_media_id
            and item.owned_path
        ),
        None,
    )
    if existing is not None and await fs_resource_handler.file_exists(
        existing.owned_path
    ):
        return PreparedSearchedCover(
            replace(candidate, provider=existing.provider),
            existing.owned_path,
            existing.mime_type,
            False,
        )
    path, mime_type = await store_searched_cover(fs_resource_handler, rom, fetch_url)
    return PreparedSearchedCover(candidate, path, mime_type, True)

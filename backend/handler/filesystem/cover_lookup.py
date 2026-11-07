"""Resolve retained cover sources and suppressed originals through one boundary."""

from __future__ import annotations

from typing import TYPE_CHECKING

from handler.filesystem.base_handler import CoverSize
from models.collection import Collection
from models.rom import Rom

if TYPE_CHECKING:
    from handler.filesystem.resources_handler import FSResourcesHandler


async def get_cover(
    handler: FSResourcesHandler,
    entity: Rom | Collection | None,
    overwrite: bool,
    url_cover: str | None,
) -> tuple[str | None, str | None]:
    if not entity:
        return None, None
    if isinstance(entity, Rom) and url_cover and url_cover.startswith("https://"):
        from handler.database import db_rom_handler
        from handler.metadata.rom_media import discover_provider_media

        candidates = discover_provider_media("provider", {"url_covers": [url_cover]})
        if db_rom_handler.get_provider_media_suppressions(entity.id, candidates):
            return entity.path_cover_s or None, entity.path_cover_l or None
    from handler.database import db_rom_handler

    if isinstance(entity, Rom) and db_rom_handler.has_removed_original_cover(entity.id):
        small = entity.path_cover_s or None
        large = entity.path_cover_l or None
    else:
        small = handler._get_cover_path(entity, CoverSize.SMALL)
        large = handler._get_cover_path(entity, CoverSize.BIG)
    if url_cover:
        if overwrite or not small:
            small = (
                await handler._store_cover(entity, url_cover, CoverSize.SMALL) or small
            )
        if overwrite or not large:
            large = (
                await handler._store_cover(entity, url_cover, CoverSize.BIG) or large
            )
    return small, large

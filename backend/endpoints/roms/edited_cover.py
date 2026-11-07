"""Prepare searched-cover edits for the standard ROM edit route."""

from dataclasses import dataclass, replace
from datetime import datetime
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError

from handler.database import db_rom_handler
from handler.filesystem import fs_resource_handler
from handler.filesystem.searched_cover import store_searched_cover
from handler.metadata.rom_media import ProviderMediaCandidate, discover_provider_media
from handler.metadata.ss_handler import add_ss_auth_to_url
from logger.logger import log
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


async def persist_rom_cover_edit(
    rom: Rom,
    id: int,
    cleaned_data: dict[str, Any],
    expected_version: datetime | None,
    searched_cover_url: str | None,
) -> None:
    """Apply form data and an optional searched cover with the same cleanup boundary."""
    from handler.database.edited_cover import update_rom_with_searched_cover

    prepared_cover = None
    applied = None
    try:
        if searched_cover_url:
            prepared_cover = await prepare_searched_cover(
                rom, searched_cover_url, add_ss_auth_to_url(searched_cover_url)
            )
            candidate = prepared_cover.candidate
            applied = update_rom_with_searched_cover(
                db_rom_handler,
                id,
                cleaned_data,
                expected_version or rom.updated_at,
                candidate.provider,
                candidate.provider_media_id,
                candidate.display_label,
                prepared_cover.mime_type,
                prepared_cover.path,
                candidate.url,
            )
        else:
            applied = db_rom_handler.update_rom(
                id, cleaned_data, expected_updated_at=expected_version or rom.updated_at
            )
        if applied is None:
            raise HTTPException(
                status_code=409, detail="The metadata changed before confirmation"
            )
    except IntegrityError as exc:
        log.error(f"Failed to update ROM {id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update ROM {id}: {exc}",
        ) from exc

    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    finally:
        if prepared_cover and prepared_cover.new_file and applied is None:
            await fs_resource_handler.remove_file(prepared_cover.path)

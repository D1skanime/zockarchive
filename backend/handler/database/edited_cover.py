"""Publish searched-cover candidates with the complete edit in one transaction."""

from datetime import datetime
from typing import Any

from decorators.database import begin_session
from models.rom import Rom, RomOwnedMediaRole


@begin_session
def update_rom_with_searched_cover(
    handler: Any,
    rom_id: int,
    data: dict,
    expected_version: datetime,
    provider: str,
    identity: str,
    label: str,
    mime_type: str,
    owned_path: str,
    source_url: str,
    session: Any = None,
) -> Rom | None:
    """CAS-publish the candidate, selection and other form fields atomically."""
    rom = handler._get_locked_owned_media_rom(session, rom_id, expected_version)
    if rom is None:
        return None
    applied = handler.reconcile_provider_owned_media(
        rom_id,
        expected_version,
        provider,
        identity,
        RomOwnedMediaRole.COVER,
        label,
        mime_type,
        owned_path,
        session=session,
    )
    if applied is None:
        return None
    # Reconciliation inserts by owner ID; reload the already-loaded collection.
    session.expire(applied.rom, ["owned_media"])
    selected = handler.select_owned_cover_media(
        rom_id,
        applied.media.id,
        applied.rom.updated_at,
        owned_path,
        owned_path,
        session=session,
    )
    if selected is None:
        raise ValueError("The selected cover could not be published")
    updated = handler.update_rom(
        rom_id,
        {
            **data,
            "url_cover": source_url,
            "path_cover_l": owned_path,
            "path_cover_s": owned_path,
        },
        expected_updated_at=selected.updated_at,
        session=session,
    )
    if updated is None:
        raise ValueError("The edit changed before the cover was published")
    return updated

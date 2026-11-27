"""Post-persistence effects for manual metadata matches."""

from typing import Any

from handler.database import db_rom_handler
from handler.metadata import meta_playmatch_handler
from handler.metadata import rom_media as rm
from handler.metadata.manual_description_refresh import refresh_manual_descriptions
from models.rom import Rom
from utils.background_tasks import fire_and_forget
from utils.database import safe_int


def _safe_int_or_none(value: Any) -> int | None:
    return None if value is None or value == "" else safe_int(value)


async def finalize_manual_match(
    rom: Rom,
    manual_igdb_media: dict[str, object] | None,
    provided_fields: set[str],
    form_data: Any,
    captured_locale: str,
) -> tuple[Rom, rm.ProviderMediaOperationError | None]:
    """Finish a manual match, preserving media errors until all side effects run.

    Description repair and the PlayMatch suggestion must run after a media
    publication failure because the metadata update itself has already persisted.
    """
    media_error: rm.ProviderMediaOperationError | None = None
    try:
        rom = await rm.publish_igdb(rom, manual_igdb_media)
    except rm.ProviderMediaOperationError as exc:
        media_error = exc

    for provider in ("ss", "steam"):
        field = provider + "_id"
        if (
            field in provided_fields
            and getattr(rom, field)
            and _safe_int_or_none(getattr(form_data, field)) == getattr(rom, field)
        ):
            await refresh_manual_descriptions(
                rom, provider, captured_locale, rom.updated_at
            )
            refreshed_rom = db_rom_handler.get_rom(rom.id)
            if refreshed_rom is not None:
                rom = refreshed_rom

    if meta_playmatch_handler.is_manual_match(form_data.model_fields_set):
        fire_and_forget(meta_playmatch_handler.submit_manual_match_suggestion(rom))

    return rom, media_error

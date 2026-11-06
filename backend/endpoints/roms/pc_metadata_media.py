"""Persist reviewed PC metadata media without growing the route module."""

from typing import Any

from handler.database import db_rom_handler
from handler.filesystem import fs_resource_handler
from models.rom import Rom


async def persist_selected_pc_metadata_media(
    rom_id: int, rom: Rom, selected_media: list[dict[str, Any]]
) -> None:
    """Store the selected provider media and preserve an existing owned cover."""
    selected_cover = next(
        (media["url"] for media in selected_media if media["kind"] == "cover"),
        None,
    )
    selected_screenshots = [
        media["url"]
        for media in selected_media
        if media["kind"] in {"screenshot", "artwork"}
    ]
    media_updates: dict[str, Any] = {}
    if selected_cover:
        path_cover_s, path_cover_l = await fs_resource_handler.get_cover(
            rom, overwrite=True, url_cover=selected_cover
        )
        media_updates.update(
            {
                "url_cover": selected_cover,
                "path_cover_s": path_cover_s,
                "path_cover_l": path_cover_l,
            }
        )
        if rom.active_owned_cover_media_id is None:
            media_updates.update(
                {
                    "original_cover_url": selected_cover,
                    "original_cover_path_s": path_cover_s,
                    "original_cover_path_l": path_cover_l,
                }
            )
    if selected_screenshots:
        media_updates.update(
            {
                "url_screenshots": [],
                "path_screenshots": await fs_resource_handler.get_rom_screenshots(
                    rom=rom,
                    overwrite=True,
                    url_screenshots=selected_screenshots,
                ),
            }
        )
    if media_updates:
        db_rom_handler.update_rom(rom_id, media_updates)

"""Persist reviewed PC metadata media without growing the route module."""

from typing import Any

from fastapi import status

from handler.database import db_rom_handler
from handler.filesystem import fs_resource_handler
from handler.metadata.rom_media import discover_provider_media
from models.rom import Rom
from utils.context import ctx_httpx_client

_IMAGE_LIMIT = 10 * 1024 * 1024


async def _store_selected_cover(rom: Rom, provider: str, url: str):
    """Download one reviewed HTTPS cover into the parent owned-media catalog."""
    candidate = discover_provider_media(
        provider,
        {"url_covers": [url], "url_screenshots": [], "url_artworks": []},
    )[0]
    client = ctx_httpx_client.get()
    async with client.stream("GET", candidate.url, timeout=30) as response:
        if response.status_code != status.HTTP_200_OK:
            raise ValueError("Provider media could not be downloaded")
        chunks: list[bytes] = []
        total = 0
        async for chunk in response.aiter_bytes():
            total += len(chunk)
            if total > _IMAGE_LIMIT:
                raise ValueError("Provider media exceeds the 10 MiB limit")
            chunks.append(chunk)
    owned_path, mime_type = await fs_resource_handler.store_owned_media_image(
        rom, candidate.role, b"".join(chunks)
    )
    return candidate, owned_path, mime_type


async def persist_selected_pc_metadata_media(
    rom_id: int, rom: Rom, provider: str, selected_media: list[dict[str, Any]]
) -> Rom:
    """Persist selected media while making a source cover the active candidate."""
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
        owned_path: str | None = None
        associated = False
        try:
            candidate, owned_path, mime_type = await _store_selected_cover(
                rom, provider, selected_cover
            )
            persisted = db_rom_handler.reconcile_provider_owned_media(
                rom_id,
                rom.updated_at,
                candidate.provider,
                candidate.provider_media_id,
                candidate.role,
                candidate.display_label,
                mime_type,
                owned_path,
            )
            if persisted is None:
                raise ValueError("Media catalog changed")
            associated = True
            selected = db_rom_handler.select_owned_cover_media(
                rom_id,
                persisted.media.id,
                persisted.rom.updated_at,
                owned_path,
                owned_path,
            )
            if selected is None:
                raise ValueError("Cover selection changed before it was applied")
            rom = selected
        except ValueError:
            if owned_path is not None and not associated:
                await fs_resource_handler.remove_file(owned_path)
            raise
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
    return db_rom_handler.get_rom(rom_id) or rom

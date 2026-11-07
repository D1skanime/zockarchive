import hashlib
from typing import Any, Awaitable

from httpx import DecodingError, TransportError
from sqlalchemy.exc import SQLAlchemyError

from endpoints.responses.rom import SimpleRomSchema
from handler.database import db_rom_handler
from handler.database.scan_write_fence import ScanWriteRejected
from handler.filesystem import fs_resource_handler
from handler.filesystem.scan_media_publication import ScanMediaBatch
from handler.filesystem.storage_access import IndeterminateOwnedPublicationError
from handler.metadata import meta_igdb_handler, meta_steam_handler
from handler.metadata.pc_match_handler import pc_metadata_match_handler
from handler.metadata.steam_merge import normalize_steam
from handler.scan_handler import MetadataSource
from logger.logger import log
from models.rom import (
    Rom,
    RomComponent,
    RomComponentKind,
    RomComponentOwnedMediaRole,
    derive_pc_component_provider_media_id,
)

_PC_IGDB_MEDIA_ROLES = {
    "cover": RomComponentOwnedMediaRole.COVER,
    "screenshot": RomComponentOwnedMediaRole.SCREENSHOT,
    "artwork": RomComponentOwnedMediaRole.ARTWORK,
}


async def _hydrate_media_urls(
    rom: Rom,
    metadata_sources: list[str],
    metadata_locale: str | None,
) -> tuple[Rom, str | None]:
    """Recover provider media URLs when a media-only scan has no cached URLs."""
    if rom.url_cover or rom.url_screenshots:
        return rom, metadata_sources[0] if metadata_sources else "provider"

    candidates: list[tuple[str, Awaitable[Any]]] = []
    if MetadataSource.IGDB in metadata_sources and rom.igdb_id:
        candidates.append(
            (
                MetadataSource.IGDB,
                meta_igdb_handler.get_rom_by_id(rom, rom.igdb_id),
            )
        )
    if MetadataSource.STEAM in metadata_sources and rom.steam_id:
        candidates.append(
            (
                MetadataSource.STEAM,
                meta_steam_handler.get_rom_by_id(
                    rom.steam_id,
                    platform_slug=rom.platform_slug,
                    metadata_locale=metadata_locale,
                ),
            )
        )

    for provider, request in candidates:
        fetched = await request
        if isinstance(fetched, dict):
            url_cover = fetched.get("url_cover")
            url_screenshots = fetched.get("url_screenshots") or []
        else:
            url_cover = getattr(fetched, "url_cover", None)
            url_screenshots = getattr(fetched, "url_screenshots", None) or []
        if not url_cover and not url_screenshots:
            continue
        rom = db_rom_handler.update_rom(
            rom.id,
            {
                "url_cover": url_cover,
                "url_screenshots": url_screenshots,
            },
        )
        return rom, provider

    return rom, None


def _refresh_rom_for_scan_emit(rom: Rom) -> Rom:
    """Load the fields required by the scan event before its session closes."""
    if not isinstance(rom, Rom):
        return rom
    return db_rom_handler.get_rom_simple(rom.id) or rom


async def _emit_scanning_rom(socket_manager: Any, rom: Rom) -> None:
    """Emit scan progress without allowing presentation errors to abort scanning."""
    try:
        emitted_rom = _refresh_rom_for_scan_emit(rom)
        await socket_manager.emit(
            "scan:scanning_rom",
            SimpleRomSchema.from_orm_with_factory(emitted_rom).model_dump(
                exclude={
                    "created_at",
                    "updated_at",
                    "rom_user",
                    "last_modified",
                    "files",
                    "sibling_roms",
                }
            ),
        )
    except (ScanWriteRejected, IndeterminateOwnedPublicationError, SQLAlchemyError):
        raise
    except Exception as exc:
        log.warning(
            "Unable to emit scan progress for ROM %s; continuing scan: %s",
            getattr(rom, "id", "unknown"),
            exc,
        )


async def _enrich_pc_dlc_from_igdb(rom: Rom, component: RomComponent) -> None:
    """Import an already-unambiguous DLC candidate into RomM-owned storage."""
    if component.kind != RomComponentKind.DLC:
        return
    candidate = await pc_metadata_match_handler.fetch_unique_related_igdb_candidate(
        rom, component
    )
    if candidate is None:
        return

    saved_component = db_rom_handler.apply_pc_component_metadata_candidate(
        rom.id,
        component.id,
        component.updated_at,
        candidate.provider,
        candidate.fields,
    )
    if saved_component is None:
        return

    steam_candidate = await pc_metadata_match_handler.fetch_validated_steam_dlc(
        rom, candidate
    )
    if steam_candidate is not None:
        current_metadata = saved_component.component_metadata
        current = {
            "name": getattr(current_metadata, "name", None),
            "summary": getattr(current_metadata, "summary", None),
            "steam_metadata": getattr(current_metadata, "steam_metadata", None),
            "metadata": {
                "main_developer": getattr(current_metadata, "main_developer", None),
                "publishers": getattr(current_metadata, "publishers", None),
                "pc_release_date": getattr(current_metadata, "pc_release_date", None),
            },
        }
        steam_data = normalize_steam(steam_candidate, current)
        if steam_data:
            steam_saved_component = (
                db_rom_handler.apply_pc_component_metadata_candidate(
                    rom.id,
                    saved_component.id,
                    saved_component.updated_at,
                    "steam",
                    steam_data,
                )
            )
            if steam_saved_component is not None:
                saved_component = steam_saved_component

    saved_component = db_rom_handler.get_pc_component_by_id(rom.id, saved_component.id)
    if saved_component is None:
        return
    existing_media = db_rom_handler.get_pc_component_provider_media_for_reconciliation(
        rom.id, saved_component.id
    )
    content_hashes: dict[int, str] = {}
    for existing in existing_media:
        try:
            content = await fs_resource_handler.read_file(existing.owned_path)
        except (FileNotFoundError, OSError, ValueError):
            continue
        if content:
            content_hashes[existing.id] = hashlib.sha256(content).hexdigest()
    with ScanMediaBatch(rom.id, rom.platform_id, fs_resource_handler.storage) as unit:
        reconciled = unit.publish_and_associate(
            lambda session: db_rom_handler.reconcile_pc_component_provider_media(
                rom.id,
                saved_component.id,
                saved_component.updated_at,
                content_hashes,
                session=session,
            )
        )
    if reconciled is None:
        return
    saved_component = db_rom_handler.get_pc_component_by_id(
        rom.id, reconciled.component.id
    )
    if saved_component is None:
        return

    for media in candidate.media:
        role = _PC_IGDB_MEDIA_ROLES.get(media.get("kind", ""))
        url = media.get("url")
        if role is None or not isinstance(url, str):
            continue
        try:
            with ScanMediaBatch(
                rom.id, rom.platform_id, fs_resource_handler.storage
            ) as unit:
                owned_path, mime_type, content_sha256 = (
                    await fs_resource_handler.store_pc_component_provider_image(
                        rom, saved_component.id, candidate.provider, role, url
                    )
                )
                provider_media_id = derive_pc_component_provider_media_id(
                    candidate.provider, role, content_sha256
                )

                def associate_dlc(
                    session,
                    saved_component=saved_component,
                    role=role,
                    mime_type=mime_type,
                    owned_path=owned_path,
                    provider_media_id=provider_media_id,
                    content_sha256=content_sha256,
                ):
                    imported = db_rom_handler.import_pc_component_provider_media(
                        rom.id,
                        saved_component.id,
                        saved_component.updated_at,
                        role,
                        mime_type,
                        owned_path,
                        candidate.provider,
                        provider_media_id,
                        content_sha256,
                        session=session,
                    )
                    if imported is None:
                        raise ValueError("DLC media catalog changed")
                    return imported

                unit.publish_and_associate(associate_dlc)
        except (ScanWriteRejected, IndeterminateOwnedPublicationError, SQLAlchemyError):
            raise
        except (ValueError, OSError, TransportError, DecodingError):
            log.warning(
                "Optional DLC media retained prior reference for component %s",
                saved_component.id,
            )
            continue
        saved_component = db_rom_handler.get_pc_component_by_id(
            rom.id, saved_component.id
        )
        if saved_component is None:
            return

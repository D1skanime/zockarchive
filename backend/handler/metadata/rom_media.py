"""Explicit provider-media discovery for the parent owned-media catalog.

This module deliberately consumes persisted provider media only.  It never
starts a scan and it never grants filesystem authority.
"""

from contextlib import nullcontext
from dataclasses import dataclass
from hashlib import sha256
from pathlib import PurePosixPath
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import httpx
from fastapi import status

from handler.database import db_provider_media_inventory_handler, db_rom_handler
from handler.database.provider_media_suppression import candidate_key
from handler.database.scan_write_fence import current_scan_write_context
from handler.filesystem import fs_resource_handler
from handler.filesystem.scan_media_publication import ScanMediaBatch
from handler.metadata.igdb_handler import IGDBRom
from models.rom import Rom, RomOwnedMediaRole, derive_owned_media_display_label
from utils.context import ctx_httpx_client

_MAX_PROVIDER_MEDIA = 500
_IMAGE_LIMIT = 10 * 1024 * 1024


@dataclass(frozen=True, slots=True)
class ProviderMediaCandidate:
    provider: str
    provider_media_id: str
    role: RomOwnedMediaRole
    url: str
    display_label: str


@dataclass(frozen=True, slots=True)
class ProviderMediaFailure:
    """A single media item that could not be persisted during a refresh."""

    provider_media_id: str
    role: RomOwnedMediaRole
    stage: str
    reason: str


class ProviderMediaOperationError(ValueError):
    """Classify a bounded provider-media operation without exposing its transport."""

    def __init__(self, stage: str, reason: str):
        super().__init__(reason)
        self.stage = stage


def normalize_provider_url(value: str) -> str:
    """Normalize an HTTPS URL to the stable identity used for refreshes."""
    parsed = urlsplit(value)
    if parsed.scheme.lower() != "https" or not parsed.netloc or parsed.username:
        raise ValueError("Provider media must use HTTPS")
    path = parsed.path or "/"
    query = urlencode(sorted(parse_qsl(parsed.query, keep_blank_values=True)))
    return urlunsplit(("https", parsed.netloc.lower(), path, query, ""))


def _candidate(
    provider: str, value: object, role: RomOwnedMediaRole
) -> ProviderMediaCandidate:
    if isinstance(value, dict):
        raw_url = value.get("url")
        native_id = value.get("id")
    else:
        raw_url = value
        native_id = None
    if not isinstance(raw_url, str):
        raise ValueError("Provider media URL is invalid")
    url = normalize_provider_url(raw_url)
    identity = (
        str(native_id)
        if native_id not in (None, "")
        else f"url-sha256:{sha256(url.encode()).hexdigest()}"
    )
    label = derive_owned_media_display_label(
        PurePosixPath(urlsplit(url).path).name or "provider-media"
    )
    return ProviderMediaCandidate(provider, identity[:450], role, url, label)


def discover_provider_media(
    provider: str, media: dict[str, object]
) -> list[ProviderMediaCandidate]:
    """Return the complete persisted cover, screenshot and artwork inventory."""
    if not provider or len(provider) > 100:
        raise ValueError("Provider is invalid")
    candidates: list[ProviderMediaCandidate] = []
    for key, role in (
        ("url_covers", RomOwnedMediaRole.COVER),
        ("url_screenshots", RomOwnedMediaRole.SCREENSHOT),
        ("url_artworks", RomOwnedMediaRole.ARTWORK),
    ):
        values = media.get(key, [])
        if not isinstance(values, list) or len(values) > _MAX_PROVIDER_MEDIA:
            raise ValueError("Provider media list is invalid or exceeds the limit")
        candidates.extend(_candidate(provider, value, role) for value in values)
    return candidates


def retain_igdb_media(
    cleaned_data: dict[str, object], igdb_rom: IGDBRom
) -> dict[str, object]:
    """Persist the complete IGDB image inventory for later owned-media refreshes."""
    artwork_urls = list(igdb_rom.get("url_artworks", []))
    media: dict[str, object] = {
        "url_covers": [igdb_rom["url_cover"]] if igdb_rom.get("url_cover") else [],
        "url_screenshots": [
            url
            for url in igdb_rom.get("url_screenshots", [])
            if url not in artwork_urls
        ],
        "url_artworks": artwork_urls,
    }
    existing_metadata = cleaned_data.get("igdb_metadata")
    retained_metadata = (
        dict(existing_metadata) if isinstance(existing_metadata, dict) else {}
    )
    retained_metadata["provider_media"] = media
    cleaned_data["igdb_metadata"] = retained_metadata
    return media


async def publish_igdb(rom: Rom, media: dict[str, object] | None) -> Rom:
    """Publish retained manual-IGDB media without replacing user choices."""
    if media is None:
        return rom
    try:
        refreshed_rom, failures = await refresh_provider_owned_media(
            rom, rom.updated_at, "igdb", media
        )
    except ProviderMediaOperationError:
        raise
    except (ValueError, OSError) as exc:
        raise ProviderMediaOperationError(
            "publication", "Provider media could not be published"
        ) from exc
    if failures:
        failure = failures[0]
        raise ProviderMediaOperationError(
            failure.stage, "Provider media could not be published"
        )
    return refreshed_rom


async def _download_provider_image(
    rom, candidate: ProviderMediaCandidate
) -> tuple[str, str]:
    client = ctx_httpx_client.get()
    try:
        async with client.stream("GET", candidate.url, timeout=30) as response:
            if response.status_code != status.HTTP_200_OK:
                raise ProviderMediaOperationError(
                    "download", "Provider media could not be downloaded"
                )
            chunks: list[bytes] = []
            total = 0
            async for chunk in response.aiter_bytes():
                total += len(chunk)
                if total > _IMAGE_LIMIT:
                    raise ProviderMediaOperationError(
                        "download", "Provider media exceeds the 10 MiB limit"
                    )
                chunks.append(chunk)
    except httpx.RequestError as exc:
        raise ProviderMediaOperationError(
            "download", "Provider media could not be downloaded"
        ) from exc
    try:
        return await fs_resource_handler.store_owned_media_image(
            rom, candidate.role, b"".join(chunks)
        )
    except (ValueError, OSError) as exc:
        raise ProviderMediaOperationError("storage", str(exc)) from exc


def persisted_provider_media(rom, provider: str) -> dict[str, object]:
    """Return the retained provider inventory needed by later media refreshes."""
    metadata = getattr(rom, f"{provider}_metadata", None)
    if isinstance(metadata, dict):
        source = metadata.get("provider_media")
        if isinstance(source, dict):
            return source
    original_cover = getattr(rom, "original_cover_url", None) or rom.url_cover
    return {
        "url_covers": [original_cover] if original_cover else [],
        "url_screenshots": rom.url_screenshots or [],
        "url_artworks": [],
    }


def persisted_provider_media_source(rom) -> str:
    """Choose the retained provider inventory before using legacy URL fields."""
    metadata = getattr(rom, "igdb_metadata", None)
    if isinstance(metadata, dict) and isinstance(metadata.get("provider_media"), dict):
        return "igdb"
    return "provider"


async def prepare_provider_media_refresh(rom, expected_version):
    """Persist the current explicit IGDB snapshot without retiring owned media.

    A confirmed empty provider snapshot replaces stale provider metadata only.
    It deliberately never retires rows, placements, cover selection, uploads,
    or suppression records. A lookup failure leaves the prior snapshot intact.
    """
    provider = persisted_provider_media_source(rom)
    source = persisted_provider_media(rom, provider)
    if not rom.igdb_id:
        return rom, provider, source

    from handler.metadata import meta_igdb_handler

    try:
        igdb_rom = await meta_igdb_handler.get_rom_by_id(rom, rom.igdb_id)
    except httpx.RequestError as exc:
        raise ProviderMediaOperationError(
            "lookup", "Provider catalog could not be retrieved"
        ) from exc
    if not igdb_rom.get("igdb_id"):
        raise ProviderMediaOperationError("lookup", "Provider catalog was not found")
    data: dict[str, object] = {"igdb_metadata": dict(rom.igdb_metadata or {})}
    source = retain_igdb_media(data, igdb_rom)
    updated = db_rom_handler.update_rom(
        rom.id,
        {"igdb_metadata": data["igdb_metadata"]},
        expected_updated_at=expected_version,
    )
    if updated is None:
        raise ProviderMediaOperationError("publication", "Media catalog changed")
    return updated, "igdb", source


async def refresh_provider_owned_media(
    rom, expected_version, provider: str, source: dict[str, object] | None = None
):
    """Refresh persisted provider images within their publication transaction."""
    if not isinstance(provider, str) or not provider:
        raise ValueError("Provider is required")
    source = source if source is not None else persisted_provider_media(rom, provider)
    failures: list[ProviderMediaFailure] = []
    try:
        candidates = discover_provider_media(provider, source)
    except ValueError as exc:
        raise ProviderMediaOperationError(
            "normalization", "Provider media catalog is invalid"
        ) from exc
    suppressed = db_rom_handler.get_provider_media_suppressions(rom.id, candidates)
    active = db_provider_media_inventory_handler.get_active_provider_media(
        rom.id, candidates
    )
    for candidate in candidates:
        if candidate_key(candidate) in suppressed:
            continue
        reusable = active.get(candidate_key(candidate))
        if (
            reusable is not None
            and isinstance(reusable.owned_path, str)
            and reusable.owned_path
        ):
            continue
        path = None
        unit = None
        try:
            scope = (
                ScanMediaBatch(rom.id, rom.platform_id, fs_resource_handler.storage)
                if current_scan_write_context() is not None
                else nullcontext()
            )
            with scope as unit:
                try:
                    path, mime_type = await _download_provider_image(rom, candidate)
                except ProviderMediaOperationError:
                    raise
                except (ValueError, OSError) as exc:
                    # Once the downloader returns a path, later failures are publication.
                    raise ProviderMediaOperationError("download", str(exc)) from exc

                def reconcile(
                    session,
                    rom=rom,
                    expected_version=expected_version,
                    candidate=candidate,
                    mime_type=mime_type,
                    path=path,
                ):
                    kwargs = {"session": session} if session is not None else {}
                    applied = db_rom_handler.reconcile_provider_owned_media(
                        rom.id,
                        expected_version,
                        candidate.provider,
                        candidate.provider_media_id,
                        candidate.role,
                        candidate.display_label,
                        mime_type,
                        path,
                        **kwargs,
                    )
                    if applied is None:
                        raise ProviderMediaOperationError(
                            "publication", "Media catalog changed"
                        )
                    return applied

                applied = (
                    unit.publish_and_associate(reconcile) if unit else reconcile(None)
                )
                expected_version = applied.rom.updated_at
                rom = applied.rom
        except (ValueError, OSError) as exc:
            if path is not None and unit is None:
                await fs_resource_handler.remove_file(path)
            failures.append(
                ProviderMediaFailure(
                    candidate.provider_media_id,
                    candidate.role,
                    (
                        exc.stage
                        if isinstance(exc, ProviderMediaOperationError)
                        else "publication" if path is not None else "storage"
                    ),
                    str(exc),
                )
            )
    return rom, failures

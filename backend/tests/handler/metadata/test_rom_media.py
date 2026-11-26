from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import httpx
import pytest

from handler.metadata import rom_media


def _rom():
    return SimpleNamespace(
        id=73,
        updated_at=datetime(2026, 9, 30, tzinfo=timezone.utc),
        platform_id=1,
        igdb_id=None,
        igdb_metadata=None,
        url_cover="https://cdn.example/cover.webp",
        url_screenshots=["https://cdn.example/shot.webp"],
    )


@pytest.mark.asyncio
async def test_refresh_uses_explicit_provider_and_keeps_sibling_after_download_failure(
    monkeypatch,
):
    rom = _rom()
    download = AsyncMock(
        side_effect=[
            ValueError("cover unavailable"),
            ("roms/73/shot.webp", "image/webp"),
        ]
    )
    reconcile = MagicMock(
        side_effect=lambda *args: SimpleNamespace(
            rom=SimpleNamespace(id=73, updated_at=args[1]),
        )
    )
    monkeypatch.setattr(rom_media, "_download_provider_image", download)
    monkeypatch.setattr(
        rom_media.db_rom_handler, "reconcile_provider_owned_media", reconcile
    )
    monkeypatch.setattr(rom_media.fs_resource_handler, "remove_file", AsyncMock())

    refreshed, failures = await rom_media.refresh_provider_owned_media(
        rom, rom.updated_at, "steam"
    )

    assert refreshed.id == 73
    assert len(failures) == 1
    assert download.await_count == 2
    assert all(call.args[1].provider == "steam" for call in download.await_args_list)
    assert reconcile.call_count == 1
    assert reconcile.call_args.args[2] == "steam"


@pytest.mark.asyncio
async def test_refresh_does_not_swallow_programming_errors(monkeypatch):
    rom = _rom()
    monkeypatch.setattr(
        rom_media,
        "_download_provider_image",
        AsyncMock(side_effect=RuntimeError("bug")),
    )

    with pytest.raises(RuntimeError, match="bug"):
        await rom_media.refresh_provider_owned_media(rom, rom.updated_at, "steam")


def test_discovery_does_not_read_rom_metadata_source():
    assert (
        rom_media.discover_provider_media(
            "selected-provider",
            {"url_screenshots": [], "url_artworks": []},
        )
        == []
    )


@pytest.mark.asyncio
async def test_prepare_refresh_replaces_same_igdb_snapshot_with_current_catalog(
    monkeypatch,
):
    rom = _rom()
    rom.igdb_id = 73
    rom.igdb_metadata = {
        "provider_media": {"url_screenshots": ["https://images.example/old.webp"]}
    }
    current_catalog = {
        "igdb_id": 73,
        "url_cover": "https://images.example/cover.webp",
        "url_screenshots": ["https://images.example/new.webp"],
        "url_artworks": [],
    }
    lookup = AsyncMock(return_value=current_catalog)
    updated = SimpleNamespace(
        id=73, updated_at=datetime(2026, 10, 1, tzinfo=timezone.utc)
    )
    update = MagicMock(return_value=updated)
    monkeypatch.setattr("handler.metadata.meta_igdb_handler.get_rom_by_id", lookup)
    monkeypatch.setattr(rom_media.db_rom_handler, "update_rom", update)

    refreshed, provider, source = await rom_media.prepare_provider_media_refresh(
        rom, rom.updated_at
    )

    assert refreshed is updated
    assert provider == "igdb"
    assert source == {
        "url_covers": ["https://images.example/cover.webp"],
        "url_screenshots": ["https://images.example/new.webp"],
        "url_artworks": [],
    }
    lookup.assert_awaited_once_with(rom, 73)
    update.assert_called_once_with(
        73,
        {"igdb_metadata": {"provider_media": source}},
        expected_updated_at=rom.updated_at,
    )
    assert rom.igdb_metadata["provider_media"]["url_screenshots"] == [
        "https://images.example/old.webp"
    ]


@pytest.mark.asyncio
async def test_prepare_refresh_preserves_snapshot_when_current_igdb_lookup_fails(
    monkeypatch,
):
    rom = _rom()
    rom.igdb_id = 73
    rom.igdb_metadata = {
        "provider_media": {"url_screenshots": ["https://images.example/old.webp"]}
    }
    lookup = AsyncMock(side_effect=httpx.RequestError("offline"))
    update = MagicMock()
    monkeypatch.setattr("handler.metadata.meta_igdb_handler.get_rom_by_id", lookup)
    monkeypatch.setattr(rom_media.db_rom_handler, "update_rom", update)

    with pytest.raises(rom_media.ProviderMediaOperationError, match="catalog") as exc:
        await rom_media.prepare_provider_media_refresh(rom, rom.updated_at)

    assert exc.value.stage == "lookup"
    update.assert_not_called()
    assert rom.igdb_metadata == {
        "provider_media": {"url_screenshots": ["https://images.example/old.webp"]}
    }


@pytest.mark.asyncio
async def test_refresh_reuses_active_media_and_retries_failed_missing_candidate(
    monkeypatch,
):
    rom = _rom()
    source: dict[str, object] = {
        "url_covers": [{"id": "cover-1", "url": "https://images.example/cover.webp"}],
        "url_screenshots": [
            {"id": "shot-1", "url": "https://images.example/shot.webp"}
        ],
    }
    reusable = SimpleNamespace(
        role=rom_media.RomOwnedMediaRole.COVER,
        owned_path="roms/73/cover.webp",
    )
    monkeypatch.setattr(
        rom_media.db_rom_handler,
        "get_provider_media_suppressions",
        MagicMock(return_value=set()),
    )
    monkeypatch.setattr(
        rom_media.db_provider_media_inventory_handler,
        "get_active_provider_media",
        MagicMock(
            return_value={
                ("igdb", "cover-1", rom_media.RomOwnedMediaRole.COVER): reusable
            }
        ),
    )
    download = AsyncMock(
        side_effect=[ValueError("temporary"), ("roms/73/shot.webp", "image/webp")]
    )
    reconcile = MagicMock(
        side_effect=lambda *args, **kwargs: SimpleNamespace(
            rom=SimpleNamespace(id=73, updated_at=rom.updated_at)
        )
    )
    monkeypatch.setattr(rom_media, "_download_provider_image", download)
    monkeypatch.setattr(
        rom_media.db_rom_handler, "reconcile_provider_owned_media", reconcile
    )
    monkeypatch.setattr(rom_media.fs_resource_handler, "remove_file", AsyncMock())

    _, failures = await rom_media.refresh_provider_owned_media(
        rom, rom.updated_at, "igdb", source
    )
    _, retry_failures = await rom_media.refresh_provider_owned_media(
        rom, rom.updated_at, "igdb", source
    )

    assert [failure.provider_media_id for failure in failures] == ["shot-1"]
    assert failures[0].stage == "download"
    assert retry_failures == []
    assert [call.args[1].provider_media_id for call in download.await_args_list] == [
        "shot-1",
        "shot-1",
    ]
    assert reconcile.call_count == 1
    assert reconcile.call_args.args[3] == "shot-1"

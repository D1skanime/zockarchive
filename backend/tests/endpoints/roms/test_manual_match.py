"""Direct contracts for manual-match effects after metadata persistence."""

from types import SimpleNamespace
from typing import cast
from unittest.mock import AsyncMock, Mock

from endpoints.roms import manual_match
from handler.metadata.rom_media import ProviderMediaOperationError
from models.rom import Rom


def _rom(**overrides: object) -> SimpleNamespace:
    values: dict[str, object] = {
        "id": 41,
        "ss_id": 73,
        "steam_id": 570,
        "updated_at": "persisted-version",
    }
    values.update(overrides)
    return SimpleNamespace(**values)


async def test_media_failure_keeps_manual_follow_up_effects_in_order(
    monkeypatch,
) -> None:
    persisted = _rom()
    after_ss_refresh = _rom(updated_at="after-ss")
    canonical = _rom(updated_at="after-steam")
    form_data = SimpleNamespace(
        ss_id="73", steam_id="570", model_fields_set={"ss_id", "steam_id"}
    )
    events: list[str] = []
    refreshed_roms = [after_ss_refresh, canonical]

    async def publish(*_args: object) -> SimpleNamespace:
        events.append("publish")
        raise ProviderMediaOperationError("publication", "storage unavailable")

    async def refresh(
        rom: SimpleNamespace, provider: str, locale: str, version: str
    ) -> None:
        events.append(f"refresh:{provider}:{locale}:{version}")

    def get_rom(rom_id: int) -> SimpleNamespace:
        events.append(f"reload:{rom_id}")
        return refreshed_roms.pop(0)

    submit = AsyncMock()

    def queue(coroutine: object) -> None:
        events.append("suggestion")
        coroutine.close()  # type: ignore[attr-defined]

    monkeypatch.setattr(manual_match.rm, "publish_igdb", publish)
    monkeypatch.setattr(manual_match, "refresh_manual_descriptions", refresh)
    monkeypatch.setattr(manual_match.db_rom_handler, "get_rom", get_rom)
    monkeypatch.setattr(
        manual_match.meta_playmatch_handler, "is_manual_match", lambda _: True
    )
    monkeypatch.setattr(
        manual_match.meta_playmatch_handler,
        "submit_manual_match_suggestion",
        submit,
    )
    monkeypatch.setattr(manual_match, "fire_and_forget", queue)

    returned, error = await manual_match.finalize_manual_match(
        cast(Rom, persisted),
        {"url_covers": []},
        {"ss_id", "steam_id"},
        form_data,
        "de",
    )

    assert returned is canonical
    assert error is not None
    assert error.stage == "publication"
    assert events == [
        "publish",
        "refresh:ss:de:persisted-version",
        "reload:41",
        "refresh:steam:de:after-ss",
        "reload:41",
        "suggestion",
    ]
    submit.assert_called_once_with(canonical)


async def test_successful_publication_still_refreshes_matching_descriptions(
    monkeypatch,
) -> None:
    persisted = _rom()
    canonical = _rom(updated_at="canonical-version")
    form_data = SimpleNamespace(ss_id=73, steam_id=None, model_fields_set={"ss_id"})
    refresh = AsyncMock()
    submit = AsyncMock()
    queued: list[object] = []

    def queue(coroutine: object) -> None:
        queued.append(coroutine)
        coroutine.close()  # type: ignore[attr-defined]

    monkeypatch.setattr(
        manual_match.rm, "publish_igdb", AsyncMock(return_value=persisted)
    )
    monkeypatch.setattr(manual_match, "refresh_manual_descriptions", refresh)
    monkeypatch.setattr(
        manual_match.db_rom_handler, "get_rom", Mock(return_value=canonical)
    )
    monkeypatch.setattr(
        manual_match.meta_playmatch_handler, "is_manual_match", lambda _: True
    )
    monkeypatch.setattr(
        manual_match.meta_playmatch_handler, "submit_manual_match_suggestion", submit
    )
    monkeypatch.setattr(manual_match, "fire_and_forget", queue)

    returned, error = await manual_match.finalize_manual_match(
        cast(Rom, persisted), None, {"ss_id"}, form_data, "en"
    )

    assert returned is canonical
    assert error is None
    refresh.assert_awaited_once_with(persisted, "ss", "en", "persisted-version")
    submit.assert_called_once_with(canonical)
    assert len(queued) == 1


async def test_non_eligible_provider_values_skip_description_refresh_but_queue_suggestion(
    monkeypatch,
) -> None:
    persisted = _rom()
    form_data = SimpleNamespace(
        ss_id="different", steam_id="570", model_fields_set={"ss_id", "steam_id"}
    )
    refresh = AsyncMock()
    submit = AsyncMock()

    def queue(coroutine: object) -> None:
        coroutine.close()  # type: ignore[attr-defined]

    monkeypatch.setattr(
        manual_match.rm, "publish_igdb", AsyncMock(return_value=persisted)
    )
    monkeypatch.setattr(manual_match, "refresh_manual_descriptions", refresh)
    monkeypatch.setattr(manual_match.db_rom_handler, "get_rom", Mock())
    monkeypatch.setattr(
        manual_match.meta_playmatch_handler, "is_manual_match", lambda _: True
    )
    monkeypatch.setattr(
        manual_match.meta_playmatch_handler, "submit_manual_match_suggestion", submit
    )
    monkeypatch.setattr(manual_match, "fire_and_forget", queue)

    returned, error = await manual_match.finalize_manual_match(
        cast(Rom, persisted), None, {"ss_id"}, form_data, "en"
    )

    assert returned is persisted
    assert error is None
    refresh.assert_not_awaited()
    submit.assert_called_once_with(persisted)

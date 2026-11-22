"""Direct contracts for post-identification completion fencing."""

from types import SimpleNamespace
from typing import cast

import pytest

from handler.scan_identification_completion import (
    bind_identification_completion,
    protect_identification_completion,
    record_identification_completion,
)
from models.rom import Rom


def make_child(rom_id: int) -> Rom:
    return cast(Rom, SimpleNamespace(id=rom_id))


@pytest.mark.asyncio
async def test_normal_completion_records_bound_child_once(monkeypatch):
    child = make_child(41)
    recorded: list[Rom] = []
    monkeypatch.setattr(
        "handler.scan_operation_checkpoint.record_completed_game", recorded.append
    )

    @protect_identification_completion
    async def identify():
        bind_identification_completion(child)
        return "finished"

    assert await identify() == "finished"
    assert recorded == [child]


@pytest.mark.asyncio
async def test_explicit_completion_is_not_recorded_again(monkeypatch):
    child = make_child(42)
    recorded: list[Rom] = []
    monkeypatch.setattr(
        "handler.scan_operation_checkpoint.record_completed_game", recorded.append
    )

    @protect_identification_completion
    async def identify():
        bind_identification_completion(child)
        record_identification_completion(child)

    await identify()
    assert recorded == [child]


@pytest.mark.asyncio
async def test_post_scan_error_still_records_bound_child(monkeypatch):
    child = make_child(43)
    recorded: list[Rom] = []
    monkeypatch.setattr(
        "handler.scan_operation_checkpoint.record_completed_game", recorded.append
    )

    @protect_identification_completion
    async def identify():
        bind_identification_completion(child)
        raise RuntimeError("provider-media-failed")

    with pytest.raises(RuntimeError, match="provider-media-failed"):
        await identify()
    assert recorded == [child]


@pytest.mark.asyncio
async def test_checkpoint_failure_does_not_replace_post_scan_error(monkeypatch):
    child = make_child(44)

    def checkpoint_failure(_rom):
        raise ValueError("checkpoint-write-failed")

    monkeypatch.setattr(
        "handler.scan_operation_checkpoint.record_completed_game", checkpoint_failure
    )

    @protect_identification_completion
    async def identify():
        bind_identification_completion(child)
        raise RuntimeError("provider-media-failed")

    with pytest.raises(RuntimeError, match="provider-media-failed"):
        await identify()


@pytest.mark.asyncio
async def test_checkpoint_failure_without_scan_error_remains_visible(monkeypatch):
    child = make_child(45)

    def checkpoint_failure(_rom):
        raise ValueError("checkpoint-write-failed")

    monkeypatch.setattr(
        "handler.scan_operation_checkpoint.record_completed_game", checkpoint_failure
    )

    @protect_identification_completion
    async def identify():
        bind_identification_completion(child)

    with pytest.raises(ValueError, match="checkpoint-write-failed"):
        await identify()

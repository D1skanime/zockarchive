import asyncio
from types import SimpleNamespace
from typing import cast
from unittest.mock import AsyncMock, Mock

import pytest

from exceptions.storage_read import MappedReadError
from handler.scan_folder_download import ensure_ps3_download_inventory
from models.rom import Rom, RomComponentKind


def test_verified_ps3_inventory_is_reused_without_a_second_scan(monkeypatch):
    component = SimpleNamespace(
        kind=RomComponentKind.FOLDER,
        manifest_members=[SimpleNamespace(missing_from_fs=False)],
    )
    rom = SimpleNamespace(id=7, components=[component])
    build = AsyncMock()
    monkeypatch.setattr(
        "handler.scan_folder_download.build_ps3_download_component", build
    )

    asyncio.run(ensure_ps3_download_inventory(cast(Rom, rom)))

    build.assert_not_awaited()


def test_missing_ps3_inventory_syncs_one_neutral_component(monkeypatch):
    retained = SimpleNamespace(kind=RomComponentKind.EXTRA)
    refreshed = SimpleNamespace(kind=RomComponentKind.FOLDER)
    rom = SimpleNamespace(id=7, components=[retained])
    handler = object()
    build = AsyncMock(return_value=refreshed)
    sync = Mock()

    async def run_inline(function, *args):
        return function(*args)

    monkeypatch.setattr(
        "handler.scan_folder_download.get_fs_rom_handler", lambda: handler
    )
    monkeypatch.setattr(
        "handler.scan_folder_download.build_ps3_download_component", build
    )
    monkeypatch.setattr(
        "handler.scan_folder_download.db_rom_handler.sync_rom_components", sync
    )
    monkeypatch.setattr("handler.scan_folder_download.asyncio.to_thread", run_inline)

    asyncio.run(ensure_ps3_download_inventory(cast(Rom, rom)))

    build.assert_awaited_once_with(handler, rom)
    sync.assert_called_once_with(7, [retained, refreshed])


@pytest.mark.parametrize(
    "error",
    [MappedReadError("denied", 1, 1, "denied"), OSError("denied")],
)
def test_ps3_inventory_failure_is_reported_without_syncing(monkeypatch, error):
    rom = SimpleNamespace(id=7, components=[])
    build = AsyncMock(side_effect=error)
    sync = Mock()
    monkeypatch.setattr(
        "handler.scan_folder_download.build_ps3_download_component", build
    )
    monkeypatch.setattr(
        "handler.scan_folder_download.db_rom_handler.sync_rom_components", sync
    )

    with pytest.raises(ValueError, match="manifest folder inventory is unavailable"):
        asyncio.run(ensure_ps3_download_inventory(cast(Rom, rom)))

    sync.assert_not_called()

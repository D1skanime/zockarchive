import asyncio
from types import SimpleNamespace
from typing import cast
from unittest.mock import AsyncMock, Mock

import pytest

from exceptions.storage_read import MappedReadError
from handler.filesystem.folder_download import SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES
from handler.metadata.base_handler import UniversalPlatformSlug as UPS
from handler.scan_folder_download import (
    _is_shared_download_inventory_eligible,
    ensure_ps3_download_inventory,
    reconcile_scanned_shared_download_inventory,
)
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


def test_authorized_ps3_scan_syncs_one_neutral_component(monkeypatch):
    retained = SimpleNamespace(kind=RomComponentKind.EXTRA)
    refreshed = SimpleNamespace(kind=RomComponentKind.FOLDER)
    rom = SimpleNamespace(id=7, platform_id=3, components=[retained])
    handler = object()
    build = AsyncMock(return_value=refreshed)
    sync = Mock()

    class InlineBatch:
        def __init__(self, *_args):
            pass

        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return False

        def publish_and_associate(self, operation):
            operation(object())

    monkeypatch.setattr(
        "handler.scan_folder_download.get_fs_rom_handler", lambda: handler
    )
    monkeypatch.setattr(
        "handler.scan_folder_download.build_ps3_download_component", build
    )
    monkeypatch.setattr(
        "handler.scan_folder_download.db_rom_handler.sync_rom_components", sync
    )
    monkeypatch.setattr("handler.scan_folder_download.ScanMediaBatch", InlineBatch)

    asyncio.run(
        reconcile_scanned_shared_download_inventory(
            cast(Rom, rom), UPS.PS3, True, object()
        )
    )

    build.assert_awaited_once_with(handler, rom)
    assert sync.call_args.args == (7, [retained, refreshed])
    assert sync.call_args.kwargs["session"] is not None


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


@pytest.mark.parametrize(
    ("platform_slug", "size_bytes", "simple_file", "expected"),
    [
        ("snes", SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES - 1, False, False),
        ("snes", SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES, False, True),
        ("snes", None, False, False),
        (UPS.WIN, 1, True, True),
        (UPS.WIN, SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES, False, False),
        (UPS.PS3, 1, False, True),
    ],
)
def test_shared_inventory_eligibility_keeps_legacy_paths_and_gates_new_platforms(
    platform_slug, size_bytes, simple_file, expected
):
    rom = SimpleNamespace(fs_size_bytes=size_bytes, has_simple_single_file=simple_file)

    assert (
        _is_shared_download_inventory_eligible(
            cast(Rom, rom), platform_slug=platform_slug
        )
        is expected
    )


@pytest.mark.parametrize(
    ("platform_slug", "size_bytes", "authorized"),
    [
        ("snes", SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES - 1, True),
        ("snes", None, True),
        ("snes", SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES, False),
    ],
)
def test_reconciliation_never_builds_inventory_without_an_authorized_eligible_scan(
    monkeypatch, platform_slug, size_bytes, authorized
):
    reconcile = AsyncMock()
    monkeypatch.setattr(
        "handler.scan_folder_download.reconcile_shared_download_inventory", reconcile
    )
    rom = SimpleNamespace(
        id=7,
        fs_size_bytes=size_bytes,
        has_simple_single_file=False,
    )

    asyncio.run(
        reconcile_scanned_shared_download_inventory(
            cast(Rom, rom), platform_slug, authorized, object()
        )
    )

    reconcile.assert_not_awaited()

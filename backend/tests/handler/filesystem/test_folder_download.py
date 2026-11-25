"""Direct selection tests for shared download manifest builders."""

import asyncio
from types import SimpleNamespace
from typing import cast
from unittest.mock import AsyncMock

from handler.filesystem import folder_download
from models.rom import Rom


def test_build_shared_download_component_uses_single_file_builder_for_dot_path_iso(
    monkeypatch,
):
    rom = cast(
        Rom,
        SimpleNamespace(
            has_simple_single_file=False,
            fs_name="Uncharted.iso",
            files=[SimpleNamespace(file_name="Uncharted.iso", file_path=".")],
        ),
    )
    handler = object()
    expected_component = object()
    single_file_builder = AsyncMock(return_value=expected_component)
    folder_builder = AsyncMock()
    monkeypatch.setattr(
        folder_download, "build_single_file_download_component", single_file_builder
    )
    monkeypatch.setattr(
        folder_download, "build_folder_download_component", folder_builder
    )

    component = asyncio.run(
        folder_download.build_shared_download_component(handler, rom)
    )

    assert component is expected_component
    single_file_builder.assert_awaited_once_with(handler, rom)
    folder_builder.assert_not_awaited()


def test_build_shared_download_component_uses_folder_builder_for_folder_rom(
    monkeypatch,
):
    rom = cast(
        Rom,
        SimpleNamespace(
            has_simple_single_file=False,
            fs_name="Uncharted",
            files=[SimpleNamespace(file_name="content.bin", file_path="PS3_GAME")],
        ),
    )
    handler = object()
    expected_component = object()
    single_file_builder = AsyncMock()
    folder_builder = AsyncMock(return_value=expected_component)
    monkeypatch.setattr(
        folder_download, "build_single_file_download_component", single_file_builder
    )
    monkeypatch.setattr(
        folder_download, "build_folder_download_component", folder_builder
    )

    component = asyncio.run(
        folder_download.build_shared_download_component(handler, rom)
    )

    assert component is expected_component
    single_file_builder.assert_not_awaited()
    folder_builder.assert_awaited_once_with(handler, rom, inventory=None)

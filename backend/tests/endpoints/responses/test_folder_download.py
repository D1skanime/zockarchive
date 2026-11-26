from types import SimpleNamespace
from typing import cast

import pytest

from endpoints.responses.folder_download import (
    shared_download_capability,
    shared_download_preparation_capability,
)
from handler.filesystem.folder_download import (
    SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES,
    has_shared_download_single_file,
)
from handler.metadata.base_handler import UniversalPlatformSlug as UPS
from models.rom import Rom, RomComponentKind


def _member(size_bytes: int, *, sha256: str = "a" * 64, missing: bool = False):
    return SimpleNamespace(
        relative_path="content.bin",
        size_bytes=size_bytes,
        sha256=sha256,
        missing_from_fs=missing,
    )


def _folder_rom(
    platform_slug: str,
    members,
    *,
    missing_from_fs: bool = False,
):
    return cast(
        Rom,
        SimpleNamespace(
            platform_slug=platform_slug,
            missing_from_fs=missing_from_fs,
            has_simple_single_file=False,
            files=[],
            fs_size_bytes=None,
            components=[
                SimpleNamespace(
                    kind=RomComponentKind.FOLDER,
                    relative_path="folder-download",
                    manifest_members=members,
                )
            ],
        ),
    )


@pytest.mark.parametrize(
    ("size_bytes", "expected"),
    [
        (SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES - 1, False),
        (SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES, True),
        (SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES + 1, True),
    ],
)
def test_additional_platform_folder_capability_uses_the_inclusive_recorded_threshold(
    size_bytes, expected
):
    capability = shared_download_capability(_folder_rom("snes", [_member(size_bytes)]))

    assert (capability is not None) is expected
    if capability is not None:
        assert capability.source_kind == "folder"
        assert capability.total_size_bytes == size_bytes


@pytest.mark.parametrize("platform_slug", [UPS.WIN, UPS.PS3])
def test_all_platforms_require_the_shared_folder_size_threshold(platform_slug):
    capability = shared_download_capability(_folder_rom(platform_slug, [_member(1)]))

    assert capability is None


def test_folder_capability_uses_the_sum_of_small_members_at_the_threshold():
    half = SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES // 2

    capability = shared_download_capability(
        _folder_rom(
            UPS.PS3, [_member(half), _member(SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES - half)]
        )
    )

    assert capability is not None
    assert capability.total_size_bytes == SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES


@pytest.mark.parametrize("platform_slug", [UPS.WIN, UPS.PS3, "snes"])
@pytest.mark.parametrize(
    ("size_bytes", "expected"),
    [
        (SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES - 1, False),
        (SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES, True),
        (SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES + 1, True),
    ],
)
def test_legacy_inventory_preparation_uses_the_universal_threshold(
    platform_slug, size_bytes, expected
):
    rom = _folder_rom(platform_slug, [])
    rom.components = []
    rom.fs_size_bytes = size_bytes

    capability = shared_download_preparation_capability(rom)

    assert (capability is not None) is expected


def test_single_file_capability_requires_matching_recorded_file_evidence():
    size_bytes = SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES
    member = _member(size_bytes)
    rom = _folder_rom("snes", [member])
    rom.has_simple_single_file = True
    rom.fs_size_bytes = size_bytes
    rom.files = [SimpleNamespace(file_size_bytes=size_bytes, missing_from_fs=False)]
    rom.components[0].relative_path = "single-file-download"
    member.relative_path = ""

    capability = shared_download_capability(rom)

    assert capability is not None
    assert capability.source_kind == "file"
    assert capability.total_size_bytes == size_bytes


@pytest.mark.parametrize(
    "members, missing_from_fs",
    [
        ([], False),
        ([_member(1, sha256="short")], False),
        ([_member(SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES, missing=True)], False),
        ([_member(SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES)], True),
    ],
)
def test_folder_capability_rejects_missing_or_incomplete_persisted_inventory(
    members, missing_from_fs
):
    assert (
        shared_download_capability(
            _folder_rom("snes", members, missing_from_fs=missing_from_fs)
        )
        is None
    )


def test_single_file_capability_rejects_inconsistent_size_without_estimating():
    size_bytes = SHARED_DOWNLOAD_MINIMUM_SIZE_BYTES
    rom = _folder_rom("snes", [_member(size_bytes)])
    rom.has_simple_single_file = True
    rom.fs_size_bytes = size_bytes
    rom.files = [SimpleNamespace(file_size_bytes=size_bytes - 1, missing_from_fs=False)]
    rom.components[0].relative_path = "single-file-download"
    rom.components[0].manifest_members[0].relative_path = ""

    assert shared_download_capability(rom) is None


def test_legacy_dot_path_iso_is_preparable_as_a_single_file_without_inventory():
    rom = cast(
        Rom,
        SimpleNamespace(
            platform_slug=UPS.PS3,
            missing_from_fs=False,
            fs_size_bytes=33,
            has_simple_single_file=False,
            fs_name="Uncharted.iso",
            files=[
                SimpleNamespace(
                    file_name="Uncharted.iso",
                    file_path=".",
                    file_size_bytes=33,
                    missing_from_fs=False,
                )
            ],
            components=[],
        ),
    )

    capability = shared_download_preparation_capability(rom)

    assert has_shared_download_single_file(rom) is True
    assert capability is None


def test_dot_path_requires_the_exact_direct_rom_filename():
    rom = cast(
        Rom,
        SimpleNamespace(
            has_simple_single_file=False,
            fs_name="Uncharted.iso",
            files=[SimpleNamespace(file_name="other.iso", file_path=".")],
        ),
    )

    assert has_shared_download_single_file(rom) is False

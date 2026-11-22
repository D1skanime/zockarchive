import binascii
import hashlib
from pathlib import Path

import pytest

from config.config_manager import Config
from handler.filesystem import roms_handler
from handler.filesystem.roms_handler import FSRomsHandler
from models.platform import Platform
from models.rom import Rom
from utils.archives import ArchiveReadError


@pytest.mark.asyncio
async def test_interrupted_archive_uses_stable_raw_hash(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
):
    """Member-reader failures must fall back to the archive's stable raw hash."""
    archive_bytes = b"archive container bytes, not extracted member bytes"
    expected = (
        f"{binascii.crc32(archive_bytes):08x}",
        hashlib.md5(archive_bytes, usedforsecurity=False).hexdigest(),
        hashlib.sha1(archive_bytes, usedforsecurity=False).hexdigest(),
    )
    roms_path = tmp_path / "n64" / "roms"
    roms_path.mkdir(parents=True)
    (roms_path / "interrupted.zip").write_bytes(archive_bytes)
    handler = FSRomsHandler()
    handler.base_path = tmp_path
    platform = Platform(name="Nintendo 64", slug="n64", fs_slug="n64")
    rom = Rom(
        id=1,
        fs_name="interrupted.zip",
        fs_extension="zip",
        fs_path="n64/roms",
        platform=platform,
    )
    config = Config(
        EXCLUDED_PLATFORMS=[],
        EXCLUDED_SINGLE_EXT=[],
        EXCLUDED_SINGLE_FILES=[],
        EXCLUDED_MULTI_FILES=[],
        EXCLUDED_MULTI_PARTS_EXT=[],
        EXCLUDED_MULTI_PARTS_FILES=[],
        PLATFORMS_BINDING={},
        PLATFORMS_VERSIONS={},
        ROMS_FOLDER_NAME="roms",
        FIRMWARE_FOLDER_NAME="bios",
    )
    config.has_structure_path_b = True
    monkeypatch.setattr("handler.filesystem.roms_handler.cm.get_config", lambda: config)
    observed = []

    for extracted_members in ((b"first",), (b"first", b"second")):

        def interrupted_reader(*_args, members=extracted_members):
            for index, member in enumerate(members):
                yield f"member-{index}.bin", len(member), [member]
            raise ArchiveReadError("simulated interrupted archive reader")

        monkeypatch.setitem(roms_handler.ARCHIVE_READERS, ".zip", interrupted_reader)
        parsed = await handler.get_rom_files(rom)
        observed.append((parsed.crc_hash, parsed.md5_hash, parsed.sha1_hash))
        assert parsed.rom_files[0].archive_members is None

    assert observed == [expected, expected]

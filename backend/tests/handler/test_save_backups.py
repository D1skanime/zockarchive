import io
import zipfile

import pytest
from fastapi import HTTPException
from tests._zipfile_shim import reload_zipfile

import handler.save_backups as save_backups
from handler.save_backups import inspect_archive, validate_relative_path


def test_inspect_archive_preserves_nested_unicode_manifest(tmp_path):
    reload_zipfile()
    archive_path = tmp_path / "backup.zip"
    with zipfile.ZipFile(archive_path, "w") as archive:
        archive.writestr("gamesaves/über save.sav", b"save-bytes")
        archive.writestr("gamesaves/profile/config.json", b"{}")

    manifest, total_size = inspect_archive(str(archive_path))

    assert [item["path"] for item in manifest] == [
        "gamesaves/über save.sav",
        "gamesaves/profile/config.json",
    ]
    assert total_size == len(b"save-bytes{}")


@pytest.mark.parametrize("path", ["../save.sav", "/save.sav", "folder\\save.sav"])
def test_rejects_unsafe_backup_member_paths(path):
    with pytest.raises(HTTPException):
        validate_relative_path(path)


def test_rejects_special_zip_members(tmp_path):
    reload_zipfile()
    archive_path = tmp_path / "special.zip"
    info = zipfile.ZipInfo("gamesaves/special")
    info.external_attr = 0o010644 << 16
    with zipfile.ZipFile(archive_path, "w") as archive:
        archive.writestr(info, b"target")

    with pytest.raises(HTTPException):
        inspect_archive(str(archive_path))


@pytest.mark.parametrize(("max_size", "max_ratio"), [(10, 100), (100, 10)])
def test_rejects_member_when_stream_exceeds_declared_zip_limits(
    tmp_path, monkeypatch, max_size, max_ratio
):
    """Runtime byte accounting rejects streams that ZIP metadata understates."""
    reload_zipfile()
    archive_path = tmp_path / "forged-header.zip"
    with zipfile.ZipFile(archive_path, "w") as archive:
        archive.writestr("gamesaves/save.sav", b"x")

    original_open = zipfile.ZipFile.open

    def forged_stream(archive, item, *args, **kwargs):
        if item.filename == "gamesaves/save.sav":
            return io.BytesIO(b"x" * 11)
        return original_open(archive, item, *args, **kwargs)

    monkeypatch.setattr(zipfile.ZipFile, "open", forged_stream)
    monkeypatch.setattr(save_backups, "MAX_UNCOMPRESSED_BYTES", max_size)
    monkeypatch.setattr(save_backups, "MAX_COMPRESSION_RATIO", max_ratio)

    with pytest.raises(HTTPException, match="configured limits"):
        inspect_archive(str(archive_path))

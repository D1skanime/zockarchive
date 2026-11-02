import zipfile

import pytest
from fastapi import HTTPException
from tests._zipfile_shim import reload_zipfile

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

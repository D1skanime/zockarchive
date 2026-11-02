import zipfile
from io import BytesIO
from pathlib import Path
from unittest import mock

from fastapi import status
from tests._zipfile_shim import reload_zipfile

from handler.database import db_rom_handler, db_save_backup_handler
from models.rom import Rom
from models.user import User


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _archive() -> bytes:
    reload_zipfile()
    buffer = BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        archive.writestr("gamesaves/save 01.sav", b"first-save")
        archive.writestr("gamesaves/Unterordner/über.cfg", b"config")
    return buffer.getvalue()


def _extract_files(data: bytes) -> dict[str, bytes]:
    reload_zipfile()
    with zipfile.ZipFile(BytesIO(data)) as archive:
        return {
            item.filename: archive.read(item)
            for item in archive.infolist()
            if not item.is_dir()
        }


@mock.patch("endpoints.save_backups.authorize_api_storage_operation")
def test_backup_upload_download_round_trip_is_owner_scoped(
    authorize,
    client,
    access_token: str,
    viewer_access_token: str,
    admin_user: User,
    rom: Rom,
    tmp_path: Path,
):
    stored = tmp_path / "stored.zip"
    archive_bytes = _archive()
    original_files = _extract_files(archive_bytes)

    async def write_archive(file, path, filename):
        stored.write_bytes(file.file.read())

    with (
        mock.patch(
            "endpoints.save_backups.fs_asset_handler.write_file",
            side_effect=write_archive,
        ),
        mock.patch(
            "endpoints.save_backups.fs_asset_handler.validate_path", return_value=stored
        ),
    ):
        created = client.post(
            "/api/save-backups",
            headers=_auth(access_token),
            data={
                "rom_id": str(rom.id),
                "backup_name": "Witcher 3 01.11.2026",
                "source_folder": "gamesaves",
                "restore_path": r"%USERPROFILE%\\Documents\\The Witcher 3\\gamesaves",
            },
            files={"archive": ("backup.zip", archive_bytes, "application/zip")},
        )
        assert created.status_code == status.HTTP_200_OK
        payload = created.json()
        assert payload["file_count"] == 2
        assert payload["manifest"][1]["path"] == "gamesaves/Unterordner/über.cfg"
        notes = db_rom_handler.get_rom_notes(rom.id, admin_user.id)
        assert len(notes) == 1
        assert notes[0].is_public is False

        listed = client.get(
            f"/api/save-backups/rom/{rom.id}", headers=_auth(access_token)
        )
        assert [item["id"] for item in listed.json()] == [payload["id"]]

        denied = client.get(
            payload["download_path"], headers=_auth(viewer_access_token)
        )
        assert denied.status_code == status.HTTP_404_NOT_FOUND

        downloaded = client.get(payload["download_path"], headers=_auth(access_token))
        assert downloaded.status_code == status.HTTP_200_OK
        assert downloaded.content == archive_bytes
        assert _extract_files(downloaded.content) == original_files

        updated = client.put(
            f"/api/save-backups/{payload['id']}/restore-path",
            headers=_auth(access_token),
            data={"restore_path": r"%USERPROFILE%\\Saved Games\\Witcher"},
        )
        assert updated.status_code == status.HTTP_200_OK
        assert updated.json()["restore_path"].endswith("Witcher")
        notes = db_rom_handler.get_rom_notes(rom.id, admin_user.id)
        assert r"%USERPROFILE%\\Saved Games\\Witcher" in notes[0].content

        deleted = client.delete(
            f"/api/save-backups/{payload['id']}", headers=_auth(access_token)
        )
        assert deleted.status_code == status.HTTP_200_OK
        assert db_save_backup_handler.get_backup(payload["id"], admin_user.id) is None
        assert db_rom_handler.get_rom_notes(rom.id, admin_user.id) == []

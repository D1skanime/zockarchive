"""Owner-scoped API for private PC save-folder backups."""

from __future__ import annotations

import asyncio
import os
import uuid

from fastapi import File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse

from decorators.auth import protected_route
from endpoints.responses.save_backups import SaveBackupSchema
from endpoints.storage_policy import authorize_api_storage_operation
from handler.auth.constants import Scope
from handler.auth.dependencies import assert_rom_visible
from handler.database import db_rom_handler, db_save_backup_handler
from handler.filesystem import fs_asset_handler, storage_composition
from handler.filesystem.storage_policy import OwnedStorageKind, StorageOperation
from handler.save_backups import archive_sha256, check_upload_size, inspect_archive
from logger.logger import log
from models.save_backup import SaveBackup
from utils.router import APIRouter

router = APIRouter(prefix="/save-backups", tags=["save-backups"])


def _schema(backup: SaveBackup) -> SaveBackupSchema:
    return SaveBackupSchema.model_validate(backup)


def _archive_name(name: str) -> str:
    clean = "".join(
        char if char.isalnum() or char in " -_" else "_" for char in name
    ).strip()
    return f"{clean or 'save-backup'}.zip"


def _note_content(backup: SaveBackup, restore_path: str) -> str:
    return (
        f"PC save backup\n\nBackup: {backup.archive_name}\n\n"
        f"Windows restore path:\n{restore_path}\n\n"
        "Restore: close the game, download and extract the ZIP, then copy its contents to the path above."
    )


@protected_route(router.post, "", [Scope.ASSETS_WRITE])
async def create_backup(
    request: Request,
    rom_id: int = Form(...),
    backup_name: str = Form(..., max_length=255),
    source_folder: str = Form(..., max_length=255),
    restore_path: str = Form(..., max_length=2000),
    archive: UploadFile = File(...),  # noqa: B008
) -> SaveBackupSchema:
    """Persist one validated ZIP archive and create its private documentation note."""
    authorize_api_storage_operation(
        StorageOperation.WRITE, storage_composition.owned[OwnedStorageKind.ASSETS]
    )
    rom = db_rom_handler.get_rom(rom_id)
    if not rom:
        raise HTTPException(status_code=404, detail="Game not found")
    assert_rom_visible(request, rom)
    if (
        not archive.filename
        or not backup_name.strip()
        or not source_folder.strip()
        or not restore_path.strip()
    ):
        raise HTTPException(
            status_code=400,
            detail="Backup name, source folder and restore path are required",
        )
    await check_upload_size(archive)
    token = str(uuid.uuid4())
    storage_path = f"save-backups/{request.user.id}/{token}.zip"
    backup: SaveBackup | None = None
    note_id: int | None = None
    try:
        await fs_asset_handler.write_file(
            archive, os.path.dirname(storage_path), os.path.basename(storage_path)
        )
        full_path = fs_asset_handler.validate_path(storage_path)
        if full_path.stat().st_size > 1024 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Backup archive is too large")
        manifest, total_size = await asyncio.to_thread(inspect_archive, str(full_path))
        archive_digest = await asyncio.to_thread(archive_sha256, full_path)
        backup = db_save_backup_handler.add_backup(
            SaveBackup(
                rom_id=rom.id,
                user_id=request.user.id,
                backup_name=backup_name.strip(),
                archive_name=_archive_name(backup_name),
                source_folder=source_folder.strip(),
                restore_path=restore_path.strip(),
                storage_path=storage_path,
                file_count=len(manifest),
                total_size_bytes=total_size,
                archive_size_bytes=full_path.stat().st_size,
                sha256=archive_digest,
                manifest=manifest,
            )
        )
        note = db_rom_handler.create_rom_note(
            rom_id=rom.id,
            user_id=request.user.id,
            title=f"Save backup - {backup.created_at.strftime('%Y-%m-%d')} - {backup.backup_id[:8]}",
            content=_note_content(backup, backup.restore_path),
            is_public=False,
            tags=["save-backup"],
        )
        note_id = note["id"]
        db_save_backup_handler.attach_note(backup.id, request.user.id, note_id)
        return _schema(backup)
    except Exception:
        log.error(
            "Save backup upload failed (backup_created=%s, note_created=%s)",
            backup is not None,
            note_id is not None,
            exc_info=True,
        )
        if note_id:
            try:
                db_rom_handler.delete_rom_note(note_id, request.user.id, rom.id)
            except Exception:
                log.warning("Failed to clean up save backup note", exc_info=True)
        if backup:
            try:
                db_save_backup_handler.delete_backup(backup.id, request.user.id)
            except Exception:
                log.warning("Failed to clean up save backup record", exc_info=True)
        try:
            await fs_asset_handler.remove_file(storage_path)
        except FileNotFoundError:
            pass
        except Exception:
            log.warning(
                "Failed to clean up incomplete save backup archive", exc_info=True
            )
        raise


@protected_route(router.get, "/rom/{rom_id}", [Scope.ASSETS_READ])
def list_backups(request: Request, rom_id: int) -> list[SaveBackupSchema]:
    rom = db_rom_handler.get_rom(rom_id)
    if not rom:
        raise HTTPException(status_code=404, detail="Game not found")
    assert_rom_visible(request, rom)
    return [
        _schema(item)
        for item in db_save_backup_handler.get_backups(request.user.id, rom_id)
    ]


@protected_route(router.get, "/{backup_id}/content", [Scope.ASSETS_READ])
def download_backup(request: Request, backup_id: int) -> FileResponse:
    backup = db_save_backup_handler.get_backup(backup_id, request.user.id)
    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")
    assert_rom_visible(request, backup.rom)
    path = fs_asset_handler.validate_path(backup.storage_path)
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Backup archive not found")
    return FileResponse(path, filename=backup.archive_name)


@protected_route(router.put, "/{backup_id}/restore-path", [Scope.ASSETS_WRITE])
def update_restore_path(
    request: Request, backup_id: int, restore_path: str = Form(..., max_length=2000)
) -> SaveBackupSchema:
    normalized_path = restore_path.strip()
    if not normalized_path:
        raise HTTPException(status_code=400, detail="Restore path is required")
    backup = db_save_backup_handler.get_backup(backup_id, request.user.id)
    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")
    assert_rom_visible(request, backup.rom)
    updated = db_save_backup_handler.update_restore_path(
        backup_id,
        request.user.id,
        normalized_path,
        _note_content(backup, normalized_path),
    )
    return _schema(updated)


@protected_route(router.delete, "/{backup_id}", [Scope.ASSETS_WRITE])
async def delete_backup(request: Request, backup_id: int) -> None:
    authorize_api_storage_operation(
        StorageOperation.DELETE, storage_composition.owned[OwnedStorageKind.ASSETS]
    )
    backup = db_save_backup_handler.get_backup(backup_id, request.user.id)
    if not backup:
        raise HTTPException(status_code=404, detail="Backup not found")
    assert_rom_visible(request, backup.rom)
    try:
        await fs_asset_handler.remove_file(backup.storage_path)
    except FileNotFoundError:
        pass
    db_save_backup_handler.delete_backup(backup_id, request.user.id)

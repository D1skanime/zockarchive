"""Validation and ownership helpers for contained DLC resource routes."""

from io import BytesIO
from pathlib import PurePosixPath

from fastapi import HTTPException, Request, UploadFile, status
from PIL import Image, UnidentifiedImageError

from endpoints.responses.rom import (
    PcComponentManualSchema,
    PcComponentNoteSchema,
)
from exceptions.endpoint_exceptions import RomNotFoundInDatabaseException
from handler.auth.dependencies import assert_rom_visible
from handler.database import db_rom_handler
from models.rom import RomComponentKind, RomComponentOwnedMediaRole

_IMAGE_UPLOAD_LIMIT = 10 * 1024 * 1024
_AUDIO_UPLOAD_LIMIT = 512 * 1024 * 1024
_UPLOAD_MIME_TYPES = {
    "JPEG": ("image/jpeg", "jpg"),
    "PNG": ("image/png", "png"),
    "WEBP": ("image/webp", "webp"),
}


def get_dlc_component(request: Request, rom_id: int, component_id: int):
    """Resolve a visible DLC component without permitting parent-ROM fallback."""
    rom = db_rom_handler.get_rom(rom_id)
    if not rom:
        raise RomNotFoundInDatabaseException(rom_id)
    assert_rom_visible(request, rom)
    component = db_rom_handler.get_pc_component_by_id(rom_id, component_id)
    if component is None or component.kind != RomComponentKind.DLC:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return rom, component


def component_note_or_404(value) -> PcComponentNoteSchema:
    if value is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return PcComponentNoteSchema.model_validate(value)


def component_manual_response(component) -> PcComponentManualSchema:
    return PcComponentManualSchema(
        manual_path=component.manual_path,
        expected_version=component.updated_at,
    )


async def _validated_image_upload(upload: UploadFile) -> tuple[bytes, str, str]:
    content = await upload.read(_IMAGE_UPLOAD_LIMIT + 1)
    if not content or len(content) > _IMAGE_UPLOAD_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Component media must be at most 10 MiB",
        )
    try:
        with Image.open(BytesIO(content)) as image:
            image.verify()
            media = _UPLOAD_MIME_TYPES.get(image.format or "")
    except (UnidentifiedImageError, OSError, ValueError):
        media = None
    if media is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Component media must be a PNG, JPEG, or WebP image",
        )
    return content, *media


async def component_upload_content(
    role: RomComponentOwnedMediaRole, upload: UploadFile
) -> tuple[bytes, str | None, str]:
    """Read image and soundtrack payloads with their distinct size limits."""
    if role == RomComponentOwnedMediaRole.SOUNDTRACK:
        content = await upload.read(_AUDIO_UPLOAD_LIMIT + 1)
        if not content or len(content) > _AUDIO_UPLOAD_LIMIT:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Component audio must be at most 512 MiB",
            )
        return content, None, PurePosixPath(upload.filename or "").suffix
    if role not in {
        RomComponentOwnedMediaRole.COVER,
        RomComponentOwnedMediaRole.BACKGROUND,
        RomComponentOwnedMediaRole.GALLERY,
        RomComponentOwnedMediaRole.SCREENSHOT,
        RomComponentOwnedMediaRole.ARTWORK,
    }:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Component uploads support image media and soundtracks only",
        )
    content, mime_type, extension = await _validated_image_upload(upload)
    return content, mime_type, extension

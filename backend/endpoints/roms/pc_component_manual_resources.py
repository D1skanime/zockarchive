"""Preserved manual-file routes for one contained PC component.

The media UI does not expose a component manual tab, but these routes retain
existing component-owned manual data without falling back to the parent ROM.
"""

from datetime import datetime
from pathlib import PurePosixPath
from typing import Annotated, cast

from fastapi import File, Form, HTTPException, Request, UploadFile, status
from fastapi.responses import StreamingResponse

from decorators.auth import protected_route
from endpoints.responses.rom import PcComponentManualSchema
from endpoints.roms.files import _content_disposition
from endpoints.roms.pc_component_resource_support import (
    component_manual_response,
    get_dlc_component,
)
from handler.auth.constants import Scope
from handler.database import db_rom_handler
from handler.filesystem import fs_resource_handler, storage_composition
from handler.filesystem.storage_access import OwnedRead, open_owned_access
from handler.filesystem.storage_policy import OwnedStorageKind, StorageOperation
from utils.router import APIRouter

router = APIRouter()


@protected_route(
    router.get, "/{id}/pc-components/{component_id}/manual", [Scope.ROMS_READ]
)
async def get_component_manual(
    request: Request, id: int, component_id: int
) -> PcComponentManualSchema:
    _, component = get_dlc_component(request, id, component_id)
    return component_manual_response(component)


@protected_route(
    router.post, "/{id}/pc-components/{component_id}/manual", [Scope.ROMS_WRITE]
)
async def upload_component_manual(
    request: Request,
    id: int,
    component_id: int,
    expected_version: Annotated[datetime, Form()],
    media: Annotated[UploadFile, File()],
) -> PcComponentManualSchema:
    rom, _ = get_dlc_component(request, id, component_id)
    content = await media.read(100 * 1024 * 1024 + 1)
    extension = PurePosixPath(media.filename or "").suffix
    owned_path: str | None = None
    try:
        owned_path = await fs_resource_handler.store_pc_component_manual(
            rom, component_id, content, extension
        )
        applied = db_rom_handler.replace_pc_component_manual(
            id, component_id, request.user.id, expected_version, owned_path
        )
        if applied is None:
            raise ValueError("The PC component changed before the manual was stored")
    except ValueError as exc:
        if owned_path is not None:
            await fs_resource_handler.remove_file(owned_path)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc
    if applied.replaced_owned_path and applied.replaced_owned_path != owned_path:
        await fs_resource_handler.remove_file(applied.replaced_owned_path)
    return component_manual_response(applied.component)


@protected_route(
    router.delete, "/{id}/pc-components/{component_id}/manual", [Scope.ROMS_WRITE]
)
async def delete_component_manual(
    request: Request,
    id: int,
    component_id: int,
    expected_version: datetime,
) -> PcComponentManualSchema:
    _, component = get_dlc_component(request, id, component_id)
    owned_path = db_rom_handler.delete_pc_component_manual(
        id, component_id, request.user.id, expected_version
    )
    if owned_path is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    try:
        await fs_resource_handler.remove_file(owned_path)
    except FileNotFoundError:
        pass
    refreshed = db_rom_handler.get_pc_component_by_id(id, component.id)
    if refreshed is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return component_manual_response(refreshed)


@protected_route(
    router.get,
    "/{id}/pc-components/{component_id}/manual/content",
    [Scope.ROMS_READ],
)
async def download_component_manual(request: Request, id: int, component_id: int):
    _, component = get_dlc_component(request, id, component_id)
    if not component.manual_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    with cast(
        OwnedRead,
        open_owned_access(
            storage_composition.owned[OwnedStorageKind.RESOURCES],
            StorageOperation.READ,
            component.manual_path,
        ),
    ) as access:
        content = access.read()
    return StreamingResponse(
        iter([content]),
        media_type="application/pdf",
        headers={
            "Content-Disposition": _content_disposition(
                "inline", PurePosixPath(component.manual_path).name
            ),
            "Content-Length": str(len(content)),
            "X-Content-Type-Options": "nosniff",
        },
    )

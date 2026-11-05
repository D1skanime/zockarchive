"""Bounded resources belonging to one contained DLC component."""

from datetime import datetime
from pathlib import PurePosixPath
from typing import Annotated, cast

from fastapi import File, Form, HTTPException, Request, UploadFile, status
from fastapi.responses import StreamingResponse

from decorators.auth import protected_route
from endpoints.responses.rom import (
    OwnedCoverSelectionRequest,
    PcComponentManualSchema,
    PcComponentNoteCreateRequest,
    PcComponentNoteSchema,
    PcComponentNoteUpdateRequest,
    PcComponentOwnedMediaPlacementMutationRequest,
    PcComponentOwnedMediaSchema,
)
from endpoints.roms.files import (
    _content_disposition,
    _mapped_chunks,
    preflight_mapped_download,
)
from endpoints.roms.pc_component_media_order import router as order_router
from endpoints.roms.pc_component_resource_support import (
    component_manual_response,
    component_note_or_404,
    component_upload_content,
    get_dlc_component,
)
from handler.auth.constants import Scope
from handler.database import db_rom_handler
from handler.filesystem import fs_resource_handler, fs_rom_handler, storage_composition
from handler.filesystem.storage_access import OwnedRead, open_owned_access
from handler.filesystem.storage_policy import OwnedStorageKind, StorageOperation
from models.rom import (
    RomComponentOwnedMediaOrigin,
    RomComponentOwnedMediaRole,
    RomOwnedMediaSurface,
)
from utils.router import APIRouter

router = APIRouter()
router.include_router(order_router)


@protected_route(
    router.get, "/{id}/pc-components/{component_id}/notes", [Scope.ROMS_READ]
)
async def get_component_notes(
    request: Request, id: int, component_id: int
) -> list[PcComponentNoteSchema]:
    get_dlc_component(request, id, component_id)
    return [
        PcComponentNoteSchema.model_validate(note)
        for note in db_rom_handler.get_pc_component_notes(
            id, component_id, request.user.id
        )
    ]


@protected_route(
    router.post, "/{id}/pc-components/{component_id}/notes", [Scope.ROMS_USER_WRITE]
)
async def create_component_note(
    request: Request, id: int, component_id: int, note: PcComponentNoteCreateRequest
) -> PcComponentNoteSchema:
    get_dlc_component(request, id, component_id)
    return component_note_or_404(
        db_rom_handler.create_pc_component_note(
            id,
            component_id,
            request.user.id,
            note.expected_version,
            note.title,
            note.content,
            note.is_public,
            note.tags,
        )
    )


@protected_route(
    router.put,
    "/{id}/pc-components/{component_id}/notes/{note_id}",
    [Scope.ROMS_USER_WRITE],
)
async def update_component_note(
    request: Request,
    id: int,
    component_id: int,
    note_id: int,
    note: PcComponentNoteUpdateRequest,
) -> PcComponentNoteSchema:
    get_dlc_component(request, id, component_id)
    fields = note.model_dump(exclude={"expected_version"}, exclude_none=True)
    return component_note_or_404(
        db_rom_handler.update_pc_component_note(
            id, component_id, request.user.id, note_id, note.expected_version, **fields
        )
    )


@protected_route(
    router.delete,
    "/{id}/pc-components/{component_id}/notes/{note_id}",
    [Scope.ROMS_USER_WRITE],
)
async def delete_component_note(
    request: Request,
    id: int,
    component_id: int,
    note_id: int,
    expected_version: datetime,
) -> dict[str, str]:
    get_dlc_component(request, id, component_id)
    if not db_rom_handler.delete_pc_component_note(
        id, component_id, request.user.id, note_id, expected_version
    ):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return {"message": "Note deleted successfully"}


@protected_route(
    router.get, "/{id}/pc-components/{component_id}/media", [Scope.ROMS_READ]
)
async def get_component_media(
    request: Request, id: int, component_id: int
) -> list[PcComponentOwnedMediaSchema]:
    get_dlc_component(request, id, component_id)
    return [
        PcComponentOwnedMediaSchema.model_validate(media)
        for media in db_rom_handler.get_pc_component_owned_media(
            id, component_id, request.user.id
        )
    ]


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


@protected_route(
    router.post, "/{id}/pc-components/{component_id}/media", [Scope.ROMS_WRITE]
)
async def upload_component_media(
    request: Request,
    id: int,
    component_id: int,
    role: Annotated[RomComponentOwnedMediaRole, Form()],
    expected_version: Annotated[datetime, Form()],
    media: Annotated[UploadFile, File()],
) -> PcComponentOwnedMediaSchema:
    rom, _ = get_dlc_component(request, id, component_id)
    content, image_mime_type, extension = await component_upload_content(role, media)
    owned_path: str | None = None
    try:
        if role == RomComponentOwnedMediaRole.SOUNDTRACK:
            owned_path, mime_type = await fs_resource_handler.store_pc_component_audio(
                rom, component_id, content, extension
            )
        else:
            owned_path = await fs_resource_handler.store_pc_component_upload(
                rom, component_id, role, content, extension
            )
            assert image_mime_type is not None
            mime_type = image_mime_type
        assert owned_path is not None
        applied = db_rom_handler.create_pc_component_owned_media(
            id,
            component_id,
            request.user.id,
            expected_version,
            role,
            mime_type,
            owned_path,
            RomComponentOwnedMediaOrigin.UPLOAD,
        )
        if applied is None:
            raise ValueError("The PC component changed before media was stored")
    except ValueError as exc:
        if owned_path is not None:
            await fs_resource_handler.remove_file(owned_path)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc
    for replaced_path in applied.replaced_owned_paths:
        await fs_resource_handler.remove_file(replaced_path)
    persisted = next(
        (
            item
            for item in db_rom_handler.get_pc_component_owned_media(
                id, component_id, request.user.id
            )
            if item.id == applied.media.id
        ),
        None,
    )
    if persisted is None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT)
    return PcComponentOwnedMediaSchema.model_validate(persisted)


@protected_route(
    router.post,
    "/{id}/pc-components/{component_id}/media/cover",
    [Scope.ROMS_WRITE],
)
async def select_component_cover_media(
    request: Request,
    id: int,
    component_id: int,
    payload: OwnedCoverSelectionRequest,
) -> PcComponentOwnedMediaSchema:
    """Select a retained Cover candidate for this exact DLC or expansion."""
    get_dlc_component(request, id, component_id)
    component = db_rom_handler.select_pc_component_owned_cover_media(
        id,
        component_id,
        request.user.id,
        payload.media_id,
        payload.expected_version,
    )
    if component is None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT)
    selected = next(
        (
            media
            for media in component.owned_media
            if media.id == component.active_owned_cover_media_id
        ),
        None,
    )
    if selected is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return PcComponentOwnedMediaSchema.model_validate(selected)


@protected_route(
    router.delete,
    "/{id}/pc-components/{component_id}/media/{media_id}",
    [Scope.ROMS_WRITE],
)
async def delete_component_media(
    request: Request,
    id: int,
    component_id: int,
    media_id: int,
    expected_version: datetime,
) -> dict[str, str]:
    get_dlc_component(request, id, component_id)
    owned_path = db_rom_handler.delete_pc_component_owned_media(
        id, component_id, request.user.id, media_id, expected_version
    )
    if owned_path is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    try:
        await fs_resource_handler.remove_file(owned_path)
    except FileNotFoundError:
        pass
    return {"message": "Media deleted successfully"}


@protected_route(
    router.post,
    "/{id}/pc-components/{component_id}/media/{media_id}/placement",
    [Scope.ROMS_WRITE],
)
async def add_component_media_placement(
    request: Request,
    id: int,
    component_id: int,
    media_id: int,
    payload: PcComponentOwnedMediaPlacementMutationRequest,
) -> PcComponentOwnedMediaSchema:
    get_dlc_component(request, id, component_id)
    media = db_rom_handler.set_pc_component_owned_media_placement(
        id,
        component_id,
        request.user.id,
        media_id,
        payload.expected_version,
        payload.surface,
        True,
    )
    if media is None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT)
    return PcComponentOwnedMediaSchema.model_validate(media)


@protected_route(
    router.delete,
    "/{id}/pc-components/{component_id}/media/{media_id}/placement",
    [Scope.ROMS_WRITE],
)
async def remove_component_media_placement(
    request: Request,
    id: int,
    component_id: int,
    media_id: int,
    expected_version: datetime,
    surface: RomOwnedMediaSurface,
) -> PcComponentOwnedMediaSchema:
    get_dlc_component(request, id, component_id)
    media = db_rom_handler.set_pc_component_owned_media_placement(
        id, component_id, request.user.id, media_id, expected_version, surface, False
    )
    if media is None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT)
    return PcComponentOwnedMediaSchema.model_validate(media)


@protected_route(
    router.get,
    "/{id}/pc-components/{component_id}/manifest-members/{member_id}/content",
    [Scope.ROMS_READ],
)
async def download_component_manifest_member(
    request: Request, id: int, component_id: int, member_id: int
):
    rom, component = get_dlc_component(request, id, component_id)
    member = next(
        (item for item in component.manifest_members if item.id == member_id), None
    )
    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    try:
        full_path = fs_rom_handler.pc_component_member_path(rom, member)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND) from None
    file = type(
        "ManifestFile",
        (),
        {"full_path": full_path},
    )()
    context, access, size = preflight_mapped_download(rom, file)
    return StreamingResponse(
        _mapped_chunks(context, access, 0, size),
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": _content_disposition(
                "attachment", PurePosixPath(member.relative_path).name
            ),
            "Content-Length": str(size),
        },
    )


@protected_route(
    router.get,
    "/{id}/pc-components/{component_id}/media/{media_id}/content",
    [Scope.ROMS_READ],
)
async def download_component_media(
    request: Request, id: int, component_id: int, media_id: int
):
    _, component = get_dlc_component(request, id, component_id)
    media = next(
        (
            item
            for item in db_rom_handler.get_pc_component_owned_media(
                id, component.id, request.user.id
            )
            if item.id == media_id
        ),
        None,
    )
    if media is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    with cast(
        OwnedRead,
        open_owned_access(
            storage_composition.owned[OwnedStorageKind.RESOURCES],
            StorageOperation.READ,
            media.owned_path,
        ),
    ) as access:
        content = access.read()
    return StreamingResponse(
        iter([content]),
        media_type=media.mime_type,
        headers={
            "Content-Disposition": _content_disposition(
                "inline", PurePosixPath(media.owned_path).name
            ),
            "Content-Length": str(len(content)),
            "X-Content-Type-Options": "nosniff",
        },
    )

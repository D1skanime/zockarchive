"""Version-checked ordering for one DLC component's owned media surface."""

from fastapi import HTTPException, Request, status

from decorators.auth import protected_route
from endpoints.responses.rom import (
    PcComponentOwnedMediaSchema,
    RomOwnedMediaReorderRequest,
)
from endpoints.roms.pc_component_resource_support import get_dlc_component
from handler.auth.constants import Scope
from handler.database import db_rom_handler
from utils.router import APIRouter

router = APIRouter()


@protected_route(
    router.put,
    "/{id}/pc-components/{component_id}/media/placements",
    [Scope.ROMS_WRITE],
)
async def reorder_component_media_placements(
    request: Request,
    id: int,
    component_id: int,
    payload: RomOwnedMediaReorderRequest,
) -> list[PcComponentOwnedMediaSchema]:
    """Replace the exact ordered set for this component-owned media surface."""
    get_dlc_component(request, id, component_id)
    media = db_rom_handler.replace_pc_component_owned_media_placements(
        id,
        component_id,
        request.user.id,
        payload.expected_version,
        payload.surface,
        payload.media_ids,
    )
    if media is None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT)
    return [PcComponentOwnedMediaSchema.model_validate(item) for item in media]

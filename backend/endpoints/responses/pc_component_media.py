"""Response contracts for component-owned PC media surfaces.

Kept separate from the broad ROM response catalog because these contracts are
only used by the DLC/component media endpoints.
"""

from pydantic import ConfigDict, Field

from endpoints.responses.base import BaseModel, UTCDatetime
from models.rom import RomOwnedMediaSurface


class PcComponentOwnedMediaPlacementSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    media_id: int
    surface: RomOwnedMediaSurface
    position: int = Field(ge=0)


class PcComponentOwnedMediaPlacementMutationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    expected_version: UTCDatetime
    surface: RomOwnedMediaSurface


class OwnedCoverSelectionRequest(BaseModel):
    """Versioned selection of an existing owner-scoped cover candidate."""

    model_config = ConfigDict(extra="forbid")

    media_id: int = Field(gt=0)
    expected_version: UTCDatetime


class PcComponentManualSchema(BaseModel):
    manual_path: str | None
    expected_version: UTCDatetime

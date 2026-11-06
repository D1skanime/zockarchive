"""Response fields that preserve a ROM's pre-selection cover source."""

from pydantic import Field

from .base import BaseModel


class OriginalCoverSourceSchema(BaseModel):
    """Stable original-cover metadata retained beside user-owned cover choices."""

    original_cover_path_small: str | None = Field(
        default=None, validation_alias="original_cover_path_s"
    )
    original_cover_path_large: str | None = Field(
        default=None, validation_alias="original_cover_path_l"
    )
    original_cover_url: str | None = None

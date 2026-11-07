"""Response fields that preserve a ROM's pre-selection cover source."""

from pydantic import Field, field_validator

from config import FRONTEND_RESOURCES_PATH

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

    @field_validator(
        "original_cover_path_small", "original_cover_path_large", mode="before"
    )
    @classmethod
    def resource_url(cls, value: str | None) -> str | None:
        return f"{FRONTEND_RESOURCES_PATH}/{value}" if value else None

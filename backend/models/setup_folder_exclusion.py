"""Durable setup declarations for direct Games folders that must not scan."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import BaseModel
from models.storage import STORAGE_MAPPING_PATH_MAX_LENGTH

if TYPE_CHECKING:
    from models.storage import StorageRoot


class SetupFolderExclusion(BaseModel):
    """An administrator's explicit decision to keep one direct child unscanned."""

    __tablename__ = "setup_folder_exclusions"
    __table_args__ = (
        UniqueConstraint(
            "storage_root_id",
            "relative_path",
            name="uq_setup_folder_exclusions_root_relative_path",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    storage_root_id: Mapped[int] = mapped_column(
        ForeignKey("storage_roots.id", ondelete="CASCADE")
    )
    relative_path: Mapped[str] = mapped_column(
        String(length=STORAGE_MAPPING_PATH_MAX_LENGTH)
    )

    storage_root: Mapped[StorageRoot] = relationship(
        "StorageRoot", lazy="joined", back_populates="setup_exclusions"
    )

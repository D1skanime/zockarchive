"""Private, immutable archive metadata for a PC game's save-folder backup."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, backref, mapped_column, relationship

from models.base import BaseModel
from utils.database import CustomJSON

if TYPE_CHECKING:
    from models.rom import Rom
    from models.user import User


class SaveBackup(BaseModel):
    """One owner-only ZIP archive and its independently verifiable manifest.

    ``restore_path`` is Windows metadata shown to the user. It is never used
    for filesystem access on the server.
    """

    __tablename__ = "save_backups"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    backup_id: Mapped[str] = mapped_column(
        String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True
    )
    rom_id: Mapped[int] = mapped_column(ForeignKey("roms.id", ondelete="CASCADE"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    note_id: Mapped[int | None] = mapped_column(
        ForeignKey("rom_notes.id", ondelete="SET NULL"), nullable=True
    )
    backup_name: Mapped[str] = mapped_column(String(255))
    archive_name: Mapped[str] = mapped_column(String(450))
    source_folder: Mapped[str] = mapped_column(String(255))
    restore_path: Mapped[str] = mapped_column(String(2000))
    platform: Mapped[str] = mapped_column(String(32), default="windows")
    storage_path: Mapped[str] = mapped_column(String(1000), unique=True)
    file_count: Mapped[int] = mapped_column(Integer)
    total_size_bytes: Mapped[int] = mapped_column(BigInteger)
    archive_size_bytes: Mapped[int] = mapped_column(BigInteger)
    sha256: Mapped[str] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(32), default="complete")
    manifest: Mapped[list[dict]] = mapped_column(CustomJSON(), default=list)

    rom: Mapped[Rom] = relationship(
        lazy="joined",
        backref=backref("save_backups", lazy="raise", cascade="all, delete-orphan"),
    )
    user: Mapped[User] = relationship(
        lazy="joined",
        backref=backref("save_backups", lazy="raise", cascade="all, delete-orphan"),
    )

    @property
    def download_path(self) -> str:
        """API path for the archive, never a storage filesystem path."""
        return f"/api/save-backups/{self.id}/content"

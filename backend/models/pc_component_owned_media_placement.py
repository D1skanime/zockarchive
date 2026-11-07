"""Persistence model for placements of component-owned PC media."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    Enum,
    ForeignKey,
    Index,
    Integer,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import BaseModel
from models.rom import RomOwnedMediaSurface

if TYPE_CHECKING:
    from models.rom import RomComponent, RomComponentOwnedMedia


class RomComponentOwnedMediaPlacement(BaseModel):
    __tablename__ = "rom_component_owned_media_placements"

    __table_args__ = (
        CheckConstraint(
            "position >= 0", name="ck_rom_component_owned_media_placements_position"
        ),
        UniqueConstraint(
            "media_id",
            "surface",
            name="uq_rom_component_owned_media_placements_media_surface",
        ),
        UniqueConstraint(
            "component_id",
            "surface",
            "position",
            name="uq_rom_component_owned_media_placements_component_surface_position",
        ),
        Index(
            "idx_rom_component_owned_media_placements_component_surface_position",
            "component_id",
            "surface",
            "position",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    component_id: Mapped[int] = mapped_column(
        ForeignKey("rom_components.id", ondelete="CASCADE")
    )
    media_id: Mapped[int] = mapped_column(
        ForeignKey("rom_component_owned_media.id", ondelete="CASCADE")
    )
    surface: Mapped[RomOwnedMediaSurface] = mapped_column(
        Enum(
            RomOwnedMediaSurface,
            values_callable=lambda surfaces: [surface.value for surface in surfaces],
            name="romcomponentownedmediasurface",
            native_enum=False,
            create_constraint=True,
        )
    )
    position: Mapped[int] = mapped_column(Integer)

    component: Mapped["RomComponent"] = relationship()
    media: Mapped["RomComponentOwnedMedia"] = relationship(back_populates="placements")

"""Database mutations that belong solely to DLC/component-owned media."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, NamedTuple

from sqlalchemy.orm import Session

from decorators.database import begin_session
from models.rom import (
    RomComponent,
    RomComponentOwnedMedia,
    RomComponentOwnedMediaPlacement,
    RomComponentOwnedMediaRole,
    RomOwnedMediaSurface,
)
from models.user import User


class AppliedPcComponentManual(NamedTuple):
    component: RomComponent
    replaced_owned_path: str | None


def _resolve_dlc_component(
    handler: Any,
    session: Session,
    rom_id: int,
    component_id: int,
    expected_updated_at: datetime | None = None,
    *,
    with_owned_media: bool = False,
) -> RomComponent | None:
    """Use the ROM handler's canonical, version-aware component resolver."""
    return handler._get_pc_dlc_component(
        session,
        rom_id,
        component_id,
        expected_updated_at,
        with_owned_media=with_owned_media,
    )


class PcComponentMediaMutationMixin:
    """Manual and placement mutations scoped to one resolved DLC component."""

    @begin_session
    def replace_pc_component_manual(
        self,
        rom_id: int,
        component_id: int,
        user_id: int,
        expected_updated_at: datetime,
        manual_path: str,
        session: Session = None,  # type: ignore
    ) -> AppliedPcComponentManual | None:
        """CAS-replace one DLC manual without mutating the parent ROM manual."""
        if session.get(User, user_id) is None:
            return None
        component = _resolve_dlc_component(
            self, session, rom_id, component_id, expected_updated_at
        )
        if component is None:
            return None
        replaced_owned_path = component.manual_path
        component.manual_path = manual_path
        component.updated_at = max(
            datetime.now(component.updated_at.tzinfo),
            component.updated_at + timedelta(seconds=1),
        )
        session.flush()
        return AppliedPcComponentManual(component, replaced_owned_path)

    @begin_session
    def delete_pc_component_manual(
        self,
        rom_id: int,
        component_id: int,
        user_id: int,
        expected_updated_at: datetime,
        session: Session = None,  # type: ignore
    ) -> str | None:
        if session.get(User, user_id) is None:
            return None
        component = _resolve_dlc_component(
            self, session, rom_id, component_id, expected_updated_at
        )
        if component is None or not component.manual_path:
            return None
        owned_path = component.manual_path
        component.manual_path = None
        component.updated_at = datetime.now(timezone.utc)
        session.flush()
        return owned_path

    @begin_session
    def set_pc_component_owned_media_placement(
        self,
        rom_id: int,
        component_id: int,
        user_id: int,
        media_id: int,
        expected_updated_at: datetime,
        surface: RomOwnedMediaSurface,
        selected: bool,
        session: Session = None,  # type: ignore
    ) -> RomComponentOwnedMedia | None:
        if session.get(User, user_id) is None:
            return None
        component = _resolve_dlc_component(
            self,
            session,
            rom_id,
            component_id,
            expected_updated_at,
            with_owned_media=True,
        )
        if component is None:
            return None
        media = next(
            (item for item in component.owned_media if item.id == media_id), None
        )
        if media is None or not self._is_pc_component_owned_media_surface_compatible(
            media.role, surface
        ):
            return None
        placement = next(
            (
                item
                for item in media.placements
                if item.component_id == component.id and item.surface == surface
            ),
            None,
        )
        if selected and placement is None:
            current = sorted(
                (
                    item
                    for item in component.owned_media
                    for item in item.placements
                    if item.surface == surface
                ),
                key=lambda item: item.position,
            )
            media.placements.append(
                RomComponentOwnedMediaPlacement(
                    component_id=component.id,
                    media_id=media.id,
                    surface=surface,
                    position=len(current),
                )
            )
        elif not selected and placement is not None:
            media.placements.remove(placement)
            session.flush()
            remaining = sorted(
                (
                    item
                    for item in component.owned_media
                    for item in item.placements
                    if item.id != placement.id and item.surface == surface
                ),
                key=lambda item: item.position,
            )
            for position, item in enumerate(remaining):
                item.position = position
        else:
            return media
        component.updated_at = datetime.now(timezone.utc)
        session.flush()
        return media

    @staticmethod
    def _is_pc_component_owned_media_surface_compatible(
        role: RomComponentOwnedMediaRole, surface: RomOwnedMediaSurface
    ) -> bool:
        if surface == RomOwnedMediaSurface.SOUNDTRACK:
            return role == RomComponentOwnedMediaRole.SOUNDTRACK
        return role in {
            RomComponentOwnedMediaRole.COVER,
            RomComponentOwnedMediaRole.BACKGROUND,
            RomComponentOwnedMediaRole.GALLERY,
            RomComponentOwnedMediaRole.SCREENSHOT,
            RomComponentOwnedMediaRole.ARTWORK,
        }

"""Version-checked parent-ROM cover selection and original-source restoration."""

from datetime import datetime, timezone
from typing import Any

from decorators.database import begin_session
from models.rom import RomOwnedMediaRole, RomOwnedMediaState


class ParentCoverMutationMixin:
    def _get_locked_owned_media_rom(
        self, session: Any, rom_id: int, expected_updated_at: datetime
    ) -> Any:
        raise NotImplementedError

    @begin_session
    def select_owned_cover_media(
        self,
        rom_id: int,
        media_id: int,
        expected_updated_at: datetime,
        path_cover_l: str,
        path_cover_s: str,
        session: Any = None,
    ):
        """Select an owned cover or restore the retained original source."""
        rom = self._get_locked_owned_media_rom(session, rom_id, expected_updated_at)
        if rom is None:
            return None
        if media_id == 0:
            if not any(
                (
                    rom.original_cover_path_l,
                    rom.original_cover_path_s,
                    rom.original_cover_url,
                )
            ):
                return None
            rom.active_owned_cover_media_id = None
            rom.path_cover_l = rom.original_cover_path_l
            rom.path_cover_s = rom.original_cover_path_s
            rom.url_cover = rom.original_cover_url
        else:
            media = next(
                (
                    item
                    for item in rom.owned_media
                    if item.id == media_id
                    and item.role == RomOwnedMediaRole.COVER
                    and item.state == RomOwnedMediaState.ACTIVE
                    and item.owned_path
                ),
                None,
            )
            if media is None:
                return None
            if rom.active_owned_cover_media_id is None and not any(
                (
                    rom.original_cover_path_l,
                    rom.original_cover_path_s,
                    rom.original_cover_url,
                )
            ):
                rom.original_cover_path_l = rom.path_cover_l
                rom.original_cover_path_s = rom.path_cover_s
                rom.original_cover_url = rom.url_cover
            rom.active_owned_cover_media_id = media.id
            rom.path_cover_l = path_cover_l
            rom.path_cover_s = path_cover_s
            rom.url_cover = ""
        rom.updated_at = datetime.now(timezone.utc)
        session.flush()
        return rom

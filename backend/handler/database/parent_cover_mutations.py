"""Version-checked parent-ROM cover selection and original-source restoration."""

from datetime import datetime, timezone
from typing import Any

from decorators.database import begin_session
from models.rom import (
    RomOwnedMedia,
    RomOwnedMediaOrigin,
    RomOwnedMediaRole,
    RomOwnedMediaState,
)


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

    @begin_session
    def delete_original_cover(
        self, rom_id: int, expected_updated_at: datetime, session: Any = None
    ):
        """Retire the original source without deleting shared resource files.

        URL tombstones use the existing provider identity contract, so refreshes
        cannot silently restore an explicitly removed source across providers.
        """
        from handler.metadata.rom_media import discover_provider_media

        rom = self._get_locked_owned_media_rom(session, rom_id, expected_updated_at)
        if rom is None or not any(
            (
                rom.original_cover_path_l,
                rom.original_cover_path_s,
                rom.original_cover_url,
            )
        ):
            return None
        source_urls = {rom.original_cover_url} if rom.original_cover_url else set()
        if rom.active_owned_cover_media_id is None and rom.url_cover:
            source_urls.add(rom.url_cover)
        identities = {"original-source": "Original cover"}
        for source_url in source_urls:
            try:
                candidate = discover_provider_media(
                    "legacy-cover", {"url_covers": [source_url]}
                )[0]
            except ValueError:
                continue
            identities[candidate.provider_media_id] = candidate.display_label
        for identity, label in identities.items():
            media = next(
                (
                    item
                    for item in rom.owned_media
                    if item.provider == "legacy-cover"
                    and item.provider_media_id == identity
                ),
                None,
            )
            if media is None:
                media = RomOwnedMedia(
                    rom_id=rom.id,
                    origin=RomOwnedMediaOrigin.PROVIDER,
                    role=RomOwnedMediaRole.COVER,
                    provider="legacy-cover",
                    provider_media_id=identity,
                    display_label=label,
                    mime_type="image/png",
                )
                session.add(media)
            media.state = RomOwnedMediaState.TOMBSTONED
            media.operator_suppressed = True
            media.owned_path = None
        if rom.active_owned_cover_media_id is None:
            rom.path_cover_l = ""
            rom.path_cover_s = ""
            rom.url_cover = ""
        rom.original_cover_path_l = ""
        rom.original_cover_path_s = ""
        rom.original_cover_url = ""
        rom.updated_at = datetime.now(timezone.utc)
        session.flush()
        return rom

    @begin_session
    def has_removed_original_cover(self, rom_id: int, session: Any = None) -> bool:
        """Prevent legacy directory discovery from reviving a retired source."""
        from sqlalchemy import select

        return (
            session.scalar(
                select(RomOwnedMedia.id).where(
                    RomOwnedMedia.rom_id == rom_id,
                    RomOwnedMedia.provider == "legacy-cover",
                    RomOwnedMedia.provider_media_id == "original-source",
                    RomOwnedMedia.operator_suppressed.is_(True),
                )
            )
            is not None
        )

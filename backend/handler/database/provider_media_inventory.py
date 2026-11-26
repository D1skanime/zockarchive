"""Read reusable active provider-owned media for one ROM refresh."""

from collections.abc import Iterable
from typing import Protocol

from sqlalchemy import select

from decorators.database import begin_session
from models.rom import (
    RomOwnedMedia,
    RomOwnedMediaOrigin,
    RomOwnedMediaRole,
    RomOwnedMediaState,
)


class ProviderMediaCandidate(Protocol):
    """The stable provider identity used by the owned-media publisher."""

    provider: str
    provider_media_id: str
    role: RomOwnedMediaRole


class DBProviderMediaInventoryHandler:
    """Find active, reusable provider files without owning publication policy."""

    @begin_session
    def get_active_provider_media(
        self, rom_id: int, candidates: Iterable[ProviderMediaCandidate], *, session=None
    ) -> dict[tuple[str, str, RomOwnedMediaRole], RomOwnedMedia]:
        """Return active provider rows whose persisted path is reusable."""
        keys = {
            (candidate.provider, candidate.provider_media_id, candidate.role)
            for candidate in candidates
        }
        if not keys:
            return {}
        providers = {provider for provider, _, _ in keys}
        identities = {identity for _, identity, _ in keys}
        rows = session.scalars(
            select(RomOwnedMedia).where(
                RomOwnedMedia.rom_id == rom_id,
                RomOwnedMedia.origin == RomOwnedMediaOrigin.PROVIDER,
                RomOwnedMedia.state == RomOwnedMediaState.ACTIVE,
                RomOwnedMedia.provider.in_(providers),
                RomOwnedMedia.provider_media_id.in_(identities),
                RomOwnedMedia.owned_path.is_not(None),
                RomOwnedMedia.owned_path != "",
            )
        )
        return {
            (media.provider, media.provider_media_id, media.role): media
            for media in rows
            if (media.provider, media.provider_media_id, media.role) in keys
            and media.provider is not None
            and media.provider_media_id is not None
        }

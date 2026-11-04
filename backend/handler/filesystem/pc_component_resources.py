"""DLC-owned resource storage kept separate from generic media storage."""

import secrets
from typing import Any

from handler.database.scan_write_fence import current_scan_write_context
from models.rom import Rom, RomComponentOwnedMediaRole

ALLOWED_COMPONENT_MANUAL_EXTENSIONS = frozenset({".pdf", ".md"})


class PcComponentResourceStorageMixin:
    async def store_pc_component_upload(
        self: Any,
        rom: Rom,
        component_id: int,
        role: RomComponentOwnedMediaRole,
        content: bytes,
        extension: str,
    ) -> str:
        media_path = f"{rom.fs_resources_path}/pc-owned-media"
        filename = f"{component_id}-upload-{role.value}.{extension}"
        await self.write_file(content, media_path, filename)
        return f"{media_path}/{filename}"

    async def store_pc_component_audio(
        self: Any, rom: Rom, component_id: int, content: bytes, extension: str
    ) -> tuple[str, str]:
        audio_types = {
            "mp3": "audio/mpeg",
            "aac": "audio/aac",
            "flac": "audio/flac",
            "ogg": "audio/ogg",
            "opus": "audio/ogg",
            "m4a": "audio/mp4",
            "wav": "audio/wav",
        }
        normalized = extension.lower().lstrip(".")
        if (
            not content
            or len(content) > 512 * 1024 * 1024
            or normalized not in audio_types
        ):
            raise ValueError(
                "Component audio has an unsupported type or exceeds the 512 MiB limit"
            )
        directory = f"{rom.fs_resources_path}/pc-owned-media"
        filename = f"{component_id}-soundtrack-{secrets.token_hex(16)}.{normalized}"
        if current_scan_write_context() is not None:
            return (
                self._stage_content(content, f"{directory}/{filename}"),
                audio_types[normalized],
            )
        await self.write_file(content, directory, filename)
        return f"{directory}/{filename}", audio_types[normalized]

    async def store_pc_component_manual(
        self: Any, rom: Rom, component_id: int, content: bytes, extension: str
    ) -> str:
        normalized = extension.lower()
        if (
            not content
            or len(content) > 100 * 1024 * 1024
            or normalized not in ALLOWED_COMPONENT_MANUAL_EXTENSIONS
        ):
            raise ValueError(
                "Component manual has an unsupported type or exceeds the 100 MiB limit"
            )
        directory = f"{rom.fs_resources_path}/pc-manual"
        filename = f"{component_id}-{secrets.token_hex(16)}{normalized}"
        if current_scan_write_context() is not None:
            return self._stage_content(content, f"{directory}/{filename}")
        await self.write_file(content, directory, filename)
        return f"{directory}/{filename}"

"""Stage searched covers under unique owned paths, never over original covers."""

from pathlib import PurePosixPath
from secrets import token_hex
from typing import Any

from handler.filesystem.resource_download import store_resource
from models.rom import Rom


async def store_searched_cover(handler: Any, rom: Rom, url: str) -> tuple[str, str]:
    """Use the existing validated streaming downloader and animation retention."""
    path = await store_resource(
        handler,
        url,
        f"{rom.fs_resources_path}/owned-media/cover-{token_hex(16)}.png",
        ("image/",),
        cover_size="big",
        preserve_animated_cover=True,
    )
    if not path:
        raise ValueError("The selected cover could not be downloaded")
    mime_type = {".gif": "image/gif", ".webp": "image/webp", ".png": "image/png"}.get(
        PurePosixPath(path).suffix, "image/png"
    )
    return path, mime_type

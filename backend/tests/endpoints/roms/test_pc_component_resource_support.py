from io import BytesIO

import pytest
from fastapi import UploadFile

from endpoints.roms.pc_component_resource_support import component_upload_content
from models.rom import RomComponentOwnedMediaRole


@pytest.mark.asyncio
async def test_soundtrack_upload_content_keeps_a_concrete_filename_extension():
    upload = UploadFile(file=BytesIO(b"audio"), filename="theme.flac")

    content, image_mime_type, extension = await component_upload_content(
        RomComponentOwnedMediaRole.SOUNDTRACK, upload
    )

    assert content == b"audio"
    assert image_mime_type is None
    assert extension == ".flac"

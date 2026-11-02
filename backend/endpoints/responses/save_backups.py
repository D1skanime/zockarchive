from pydantic import ConfigDict

from .base import BaseModel, UTCDatetime


class SaveBackupSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    backup_id: str
    rom_id: int
    backup_name: str
    archive_name: str
    source_folder: str
    restore_path: str
    platform: str
    file_count: int
    total_size_bytes: int
    archive_size_bytes: int
    sha256: str
    status: str
    manifest: list[dict]
    download_path: str
    created_at: UTCDatetime
    updated_at: UTCDatetime

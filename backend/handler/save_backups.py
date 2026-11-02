"""Validation and storage helpers for opaque PC save-folder ZIP archives."""

from __future__ import annotations

import hashlib
import stat
import zipfile
from pathlib import Path, PurePosixPath

from fastapi import HTTPException, UploadFile, status

MAX_ARCHIVE_BYTES = 1024 * 1024 * 1024
MAX_FILES = 10_000
MAX_PATH_LENGTH = 16_384
MAX_UNCOMPRESSED_BYTES = 2 * 1024 * 1024 * 1024
MAX_COMPRESSION_RATIO = 100


def _invalid(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def validate_relative_path(value: str) -> str:
    """Accept a normalized, portable archive member path and nothing else."""
    if not value or len(value) > MAX_PATH_LENGTH or "\\" in value:
        raise _invalid("Backup paths must be relative POSIX paths")
    path = PurePosixPath(value)
    if path.is_absolute() or any(part in {"", ".", ".."} for part in path.parts):
        raise _invalid("Backup path contains an invalid component")
    return path.as_posix()


def inspect_archive(path: str) -> tuple[list[dict[str, int | str]], int]:
    """Read ZIP metadata only, rejecting dangerous entries before persistence."""
    try:
        archive = zipfile.ZipFile(path)
    except (OSError, zipfile.BadZipFile) as exc:
        raise _invalid("Backup must be a readable ZIP archive") from exc

    manifest: list[dict[str, int | str]] = []
    total_size = 0
    seen: set[str] = set()
    with archive:
        for item in archive.infolist():
            if item.is_dir():
                continue
            member = validate_relative_path(item.filename)
            if member in seen:
                raise _invalid("Backup archive contains duplicate paths")
            seen.add(member)
            member_mode = item.external_attr >> 16
            member_type = stat.S_IFMT(member_mode)
            if member_type and member_type != stat.S_IFREG:
                raise _invalid("Backup archive can only contain regular files")
            if item.flag_bits & 0x1:
                raise _invalid("Encrypted backup archives are not supported")
            if item.file_size < 0 or item.compress_size < 0:
                raise _invalid("Backup archive has invalid member sizes")
            if (
                item.compress_size
                and item.file_size / item.compress_size > MAX_COMPRESSION_RATIO
            ):
                raise _invalid("Backup archive exceeds the allowed compression ratio")
            total_size += item.file_size
            if len(seen) > MAX_FILES or total_size > MAX_UNCOMPRESSED_BYTES:
                raise _invalid("Backup archive exceeds configured limits")
            digest = hashlib.sha256()
            with archive.open(item) as source:
                while chunk := source.read(64 * 1024):
                    digest.update(chunk)
            manifest.append(
                {"path": member, "size": item.file_size, "sha256": digest.hexdigest()}
            )
    if not manifest:
        raise _invalid("Backup archive does not contain files")
    return manifest, total_size


def archive_sha256(path: Path) -> str:
    """Calculate an archive checksum without retaining its bytes in memory."""
    digest = hashlib.sha256()
    with path.open("rb") as source:
        while chunk := source.read(64 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


async def check_upload_size(upload: UploadFile) -> None:
    """Reject oversized request bodies before the owned-storage write begins."""
    length = upload.size
    if length is not None and length > MAX_ARCHIVE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Backup archive is too large",
        )

"""Safe source and destination paths for immutable download manifest members."""

from pathlib import PurePosixPath

from models.rom import Rom, RomComponentManifestMember


def download_manifest_destination(rom: Rom, member: RomComponentManifestMember) -> str:
    """Build the client destination from persisted, validated manifest identity."""
    if not rom.fs_name or "/" in rom.fs_name or "\\" in rom.fs_name:
        raise ValueError("PC component manifest path is invalid")
    if not member.relative_path:
        return rom.fs_name
    relative_path = PurePosixPath(member.relative_path)
    if (
        relative_path.is_absolute()
        or not relative_path.parts
        or any(part in {"", ".", ".."} for part in relative_path.parts)
        or "\\" in member.relative_path
        or any(ord(character) < 32 for character in member.relative_path)
        or any(ord(character) < 32 for character in rom.fs_name)
    ):
        raise ValueError("PC component manifest path is invalid")
    return f"{rom.fs_name}/{relative_path.as_posix()}"


def manifest_member_source_path(rom: Rom, member: RomComponentManifestMember) -> str:
    """Resolve one persisted member below its ROM without accepting browser paths."""
    if not member.relative_path:
        return f"{rom.fs_path}/{rom.fs_name}"
    relative_path = PurePosixPath(member.relative_path)
    if (
        relative_path.is_absolute()
        or not relative_path.parts
        or any(part in {"", ".", ".."} for part in relative_path.parts)
        or "\\" in member.relative_path
    ):
        raise ValueError("PC component manifest path is invalid")
    return f"{rom.fs_path}/{rom.fs_name}/{relative_path.as_posix()}"

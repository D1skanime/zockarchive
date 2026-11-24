from handler.filesystem.download_manifest_paths import (
    download_manifest_destination,
    manifest_member_source_path,
)
from models.rom import Rom, RomComponentManifestMember


def test_single_file_manifest_member_keeps_the_iso_name_at_both_boundaries():
    rom = Rom(fs_path="ps3", fs_name="Uncharted.iso")
    member = RomComponentManifestMember(relative_path="", size_bytes=1, sha256="a" * 64)

    assert download_manifest_destination(rom, member) == "Uncharted.iso"
    assert manifest_member_source_path(rom, member) == "ps3/Uncharted.iso"


def test_manifest_member_path_rejects_a_directory_escape():
    rom = Rom(fs_path="ps3", fs_name="Game")
    member = RomComponentManifestMember(
        relative_path="../outside.iso", size_bytes=1, sha256="a" * 64
    )

    try:
        manifest_member_source_path(rom, member)
    except ValueError as error:
        assert str(error) == "PC component manifest path is invalid"
    else:
        raise AssertionError("a manifest member must not escape its ROM root")

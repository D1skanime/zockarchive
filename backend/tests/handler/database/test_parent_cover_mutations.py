"""Original-cover deletion preserves independent candidates and deletion intent."""

from handler.database import db_rom_handler
from handler.metadata.rom_media import discover_provider_media
from models.rom import RomOwnedMediaRole


def source_rom(rom):
    return db_rom_handler.update_rom(
        rom.id,
        {
            "path_cover_l": "roms/1/cover/big.png",
            "path_cover_s": "roms/1/cover/small.png",
            "url_cover": "https://cdn2.steamgriddb.com/grid/original.png",
            "original_cover_path_l": "roms/1/cover/big.png",
            "original_cover_path_s": "roms/1/cover/small.png",
            "original_cover_url": "https://cdn2.steamgriddb.com/grid/original.png",
        },
    )


def test_delete_original_removes_legacy_source_and_suppresses_reimport(rom):
    current = source_rom(rom)
    deleted = db_rom_handler.delete_original_cover(current.id, current.updated_at)
    assert deleted is not None
    fresh = db_rom_handler.get_rom(rom.id)
    assert not fresh.path_cover_l and not fresh.path_cover_s and not fresh.url_cover
    assert not fresh.original_cover_path_l and not fresh.original_cover_url
    candidates = discover_provider_media(
        "steamgriddb",
        {"url_covers": ["https://cdn2.steamgriddb.com/grid/original.png"]},
    )
    assert db_rom_handler.get_provider_media_suppressions(rom.id, candidates)
    candidate = candidates[0]
    assert (
        db_rom_handler.reconcile_provider_owned_media(
            rom.id,
            fresh.updated_at,
            candidate.provider,
            candidate.provider_media_id,
            candidate.role,
            candidate.display_label,
            "image/png",
            "roms/1/new.png",
        )
        is None
    )
    assert not db_rom_handler.get_owned_media_catalog(rom.id)


def test_delete_original_preserves_selected_upload_and_checks_version(rom):
    current = source_rom(rom)
    upload = db_rom_handler.create_owned_upload_media(
        rom.id,
        current.updated_at,
        RomOwnedMediaRole.COVER,
        "upload.webp",
        "image/webp",
        "roms/1/owned-media/upload.webp",
    )
    selected = db_rom_handler.select_owned_cover_media(
        rom.id,
        upload.media.id,
        upload.rom.updated_at,
        upload.media.owned_path,
        upload.media.owned_path,
    )
    assert db_rom_handler.delete_original_cover(rom.id, current.updated_at) is None
    deleted = db_rom_handler.delete_original_cover(rom.id, selected.updated_at)
    assert deleted is not None
    fresh = db_rom_handler.get_rom(rom.id)
    assert fresh.active_owned_cover_media_id == upload.media.id
    assert fresh.path_cover_l == upload.media.owned_path
    assert not fresh.original_cover_path_l and not fresh.original_cover_url
    assert len(db_rom_handler.get_owned_media_catalog(rom.id)) == 1
    assert (
        db_rom_handler.select_owned_cover_media(rom.id, 0, fresh.updated_at, "", "")
        is None
    )


def test_delete_original_suppresses_current_crawler_url_as_well(rom):
    current = source_rom(rom)
    current = db_rom_handler.update_rom(
        rom.id, {"url_cover": "https://cdn2.steamgriddb.com/grid/current.png"}
    )
    assert db_rom_handler.delete_original_cover(rom.id, current.updated_at)
    candidates = discover_provider_media(
        "other-provider",
        {"url_covers": ["https://cdn2.steamgriddb.com/grid/current.png"]},
    )
    assert db_rom_handler.get_provider_media_suppressions(rom.id, candidates)

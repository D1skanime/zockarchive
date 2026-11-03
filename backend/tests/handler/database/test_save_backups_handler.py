from handler.database import db_save_backup_handler
from models.rom import Rom
from models.save_backup import SaveBackup
from models.user import User


def _backup(rom: Rom, user: User, name: str) -> SaveBackup:
    return SaveBackup(
        rom_id=rom.id,
        user_id=user.id,
        archive_name=f"{name}.zip",
        backup_name=name,
        source_folder="gamesaves",
        restore_path=r"%USERPROFILE%\\Documents\\Games",
        storage_path=f"save-backups/{user.id}/{name}.zip",
        file_count=2,
        total_size_bytes=12,
        archive_size_bytes=42,
        sha256="a" * 64,
        manifest=[
            {"path": "save.sav", "size": 12, "sha256": "b" * 64},
        ],
    )


def test_lists_only_the_owners_backups(admin_user: User, rom: Rom):
    first = db_save_backup_handler.add_backup(_backup(rom, admin_user, "first"))

    backups = db_save_backup_handler.get_backups(admin_user.id, rom.id)

    assert [backup.id for backup in backups] == [first.id]


def test_updates_restore_path_without_overwriting_versions(admin_user: User, rom: Rom):
    first = db_save_backup_handler.add_backup(_backup(rom, admin_user, "first"))
    second = db_save_backup_handler.add_backup(_backup(rom, admin_user, "second"))

    updated = db_save_backup_handler.update_restore_path(
        first.id, admin_user.id, r"%USERPROFILE%\\Saved Games\\Example"
    )

    assert updated is not None
    assert updated.restore_path.endswith("Example")
    assert db_save_backup_handler.get_backup(second.id, admin_user.id) is not None

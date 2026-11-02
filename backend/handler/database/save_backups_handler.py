from collections.abc import Sequence

from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from decorators.database import begin_session
from models.rom import RomNote
from models.save_backup import SaveBackup

from .base_handler import DBBaseHandler


class DBSaveBackupsHandler(DBBaseHandler):
    """Database access for owner-scoped PC save backup records."""

    @begin_session
    def add_backup(
        self, backup: SaveBackup, session: Session = None  # type: ignore
    ) -> SaveBackup:
        session.add(backup)
        session.flush()
        return backup

    @begin_session
    def get_backups(
        self, user_id: int, rom_id: int, session: Session = None  # type: ignore
    ) -> Sequence[SaveBackup]:
        return session.scalars(
            select(SaveBackup)
            .where(SaveBackup.user_id == user_id, SaveBackup.rom_id == rom_id)
            .order_by(SaveBackup.created_at.desc())
        ).all()

    @begin_session
    def get_backup(
        self, backup_id: int, user_id: int, session: Session = None  # type: ignore
    ) -> SaveBackup | None:
        return session.scalar(
            select(SaveBackup).where(
                SaveBackup.id == backup_id, SaveBackup.user_id == user_id
            )
        )

    @begin_session
    def update_restore_path(
        self,
        backup_id: int,
        user_id: int,
        restore_path: str,
        note_content: str | None = None,
        session: Session = None,  # type: ignore
    ) -> SaveBackup | None:
        backup = session.scalar(
            select(SaveBackup).where(
                SaveBackup.id == backup_id, SaveBackup.user_id == user_id
            )
        )
        if not backup:
            return None
        backup.restore_path = restore_path
        if backup.note_id and note_content:
            note = session.scalar(
                select(RomNote).where(
                    RomNote.id == backup.note_id,
                    RomNote.user_id == user_id,
                    RomNote.rom_id == backup.rom_id,
                )
            )
            if note:
                note.content = note_content
        session.flush()
        return backup

    @begin_session
    def attach_note(
        self, backup_id: int, user_id: int, note_id: int, session: Session = None  # type: ignore
    ) -> None:
        session.execute(
            update(SaveBackup)
            .where(SaveBackup.id == backup_id, SaveBackup.user_id == user_id)
            .values(note_id=note_id)
        )

    @begin_session
    def delete_backup(
        self, backup_id: int, user_id: int, session: Session = None  # type: ignore
    ) -> bool:
        backup = session.scalar(
            select(SaveBackup).where(
                SaveBackup.id == backup_id, SaveBackup.user_id == user_id
            )
        )
        if not backup:
            return False
        if backup.note_id:
            session.execute(
                delete(RomNote).where(
                    RomNote.id == backup.note_id,
                    RomNote.user_id == user_id,
                    RomNote.rom_id == backup.rom_id,
                )
            )
        session.delete(backup)
        return True

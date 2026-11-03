"""Add durable, owner-scoped PC save backup metadata.

Revision ID: 0143_save_backups
Revises: 0142_scan_inventory_state
"""

import sqlalchemy as sa
from alembic import op

revision = "0143_save_backups"
down_revision = "0142_scan_inventory_state"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "save_backups",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("backup_id", sa.String(36), nullable=False),
        sa.Column("rom_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("note_id", sa.Integer(), nullable=True),
        sa.Column("backup_name", sa.String(255), nullable=False),
        sa.Column("archive_name", sa.String(450), nullable=False),
        sa.Column("source_folder", sa.String(255), nullable=False),
        sa.Column("restore_path", sa.String(2000), nullable=False),
        sa.Column("platform", sa.String(32), nullable=False),
        sa.Column("storage_path", sa.String(1000), nullable=False),
        sa.Column("file_count", sa.Integer(), nullable=False),
        sa.Column("total_size_bytes", sa.BigInteger(), nullable=False),
        sa.Column("archive_size_bytes", sa.BigInteger(), nullable=False),
        sa.Column("sha256", sa.String(64), nullable=False),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("manifest", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["rom_id"], ["roms.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["note_id"], ["rom_notes.id"], ondelete="SET NULL"),
        sa.UniqueConstraint("backup_id", name="uq_save_backups_backup_id"),
        sa.UniqueConstraint("storage_path", name="uq_save_backups_storage_path"),
    )
    op.create_index("ix_save_backups_backup_id", "save_backups", ["backup_id"])
    op.create_index("ix_save_backups_owner_rom", "save_backups", ["user_id", "rom_id"])


def downgrade():
    # MariaDB may use the owner/ROM composite index for a foreign key. Dropping
    # the table removes both explicit indexes after its constraints safely.
    op.drop_table("save_backups")

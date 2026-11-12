"""Persist explicit setup exclusions for direct Games folders.

Revision ID: 0147_setup_folder_exclusions
Revises: 0146_backfill_missing_original_cover_source
"""

import sqlalchemy as sa
from alembic import op

revision = "0147_setup_folder_exclusions"
down_revision = "0146_backfill_missing_original_cover_source"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Store one root-relative exclusion per direct Games folder."""
    op.create_table(
        "setup_folder_exclusions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("storage_root_id", sa.Integer(), nullable=False),
        sa.Column("relative_path", sa.String(length=700), nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["storage_root_id"], ["storage_roots.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "storage_root_id",
            "relative_path",
            name="uq_setup_folder_exclusions_root_relative_path",
        ),
    )


def downgrade() -> None:
    op.drop_table("setup_folder_exclusions")

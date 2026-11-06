"""Persist the legacy cover source independently from selectable uploads.

Revision ID: 0145_preserve_original_cover_source
Revises: 0144_active_cover_candidates
"""

import sqlalchemy as sa
from alembic import op

revision = "0145_preserve_original_cover_source"
down_revision = "0144_active_cover_candidates"
branch_labels = None
depends_on = None


def upgrade() -> None:
    for name in (
        "original_cover_path_s",
        "original_cover_path_l",
        "original_cover_url",
    ):
        op.add_column("roms", sa.Column(name, sa.Text(), nullable=True))
    op.execute(
        "UPDATE roms SET original_cover_path_s = path_cover_s, "
        "original_cover_path_l = path_cover_l, original_cover_url = url_cover "
        "WHERE active_owned_cover_media_id IS NULL"
    )


def downgrade() -> None:
    for name in (
        "original_cover_url",
        "original_cover_path_l",
        "original_cover_path_s",
    ):
        op.drop_column("roms", name)

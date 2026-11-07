"""Preserve current cover sources omitted before original-source retention.

Revision ID: 0146_backfill_missing_original_cover_source
Revises: 0145_preserve_original_cover_source
"""

from alembic import op

revision = "0146_backfill_missing_original_cover_source"
down_revision = "0145_preserve_original_cover_source"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Retain only an existing source when no original reference was recorded."""
    op.execute(
        "UPDATE roms SET original_cover_path_s = path_cover_s, "
        "original_cover_path_l = path_cover_l, original_cover_url = url_cover "
        "WHERE COALESCE(original_cover_path_s, '') = '' "
        "AND COALESCE(original_cover_path_l, '') = '' "
        "AND COALESCE(original_cover_url, '') = '' "
        "AND (COALESCE(path_cover_s, '') <> '' "
        "OR COALESCE(path_cover_l, '') <> '' "
        "OR COALESCE(url_cover, '') <> '')"
    )


def downgrade() -> None:
    """Original-source data is intentionally preserved on rollback."""

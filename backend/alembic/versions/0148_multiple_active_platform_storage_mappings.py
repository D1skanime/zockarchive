"""Permit multiple active direct folders for one platform without data loss.

Revision ID: 0148_multiple_active_platform_storage_mappings
Revises: 0147_setup_folder_exclusions

The upgrade only drops the historical platform-wide unique constraint when it
is present. MariaDB, MySQL, and PostgreSQL all expose named unique constraints
through SQLAlchemy inspection, while Alembic batch operations issue the
dialect-correct DDL. Existing mapping and audit rows are never rewritten or
deleted. Downgrade refuses plural platform data before restoring that legacy
constraint, so it cannot silently discard a valid active mapping.
"""

import sqlalchemy as sa
from alembic import op

revision = "0148_multiple_active_platform_storage_mappings"
down_revision = "0147_setup_folder_exclusions"
branch_labels = None
depends_on = None

_PLATFORM_UNIQUE = "uq_platform_storage_mappings_platform_id"


def _has_unique_constraint(connection: sa.Connection, name: str) -> bool:
    return any(
        constraint.get("name") == name
        for constraint in sa.inspect(connection).get_unique_constraints(
            "platform_storage_mappings"
        )
    )


def upgrade() -> None:
    """Remove only a surviving historical one-platform-one-row constraint."""
    connection = op.get_bind()
    if _has_unique_constraint(connection, _PLATFORM_UNIQUE):
        with op.batch_alter_table("platform_storage_mappings") as batch_op:
            batch_op.drop_constraint(_PLATFORM_UNIQUE, type_="unique")


def downgrade() -> None:
    """Refuse lossy restoration of the retired singular platform invariant."""
    connection = op.get_bind()
    duplicate = connection.execute(
        sa.text(
            "SELECT platform_id FROM platform_storage_mappings "
            "GROUP BY platform_id HAVING COUNT(*) > 1 LIMIT 1"
        )
    ).first()
    if duplicate is not None:
        raise RuntimeError(
            "Cannot restore singular platform mapping uniqueness while a platform has multiple mappings"
        )
    if not _has_unique_constraint(connection, _PLATFORM_UNIQUE):
        with op.batch_alter_table("platform_storage_mappings") as batch_op:
            batch_op.create_unique_constraint(_PLATFORM_UNIQUE, ["platform_id"])

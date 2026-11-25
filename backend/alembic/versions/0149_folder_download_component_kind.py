"""Add a neutral persisted folder-download component kind.

Revision ID: 0149_folder_download_component_kind
Revises: 0148_multiple_active_platform_storage_mappings
"""

import sqlalchemy as sa
from alembic import op

from utils.database import is_postgresql

revision = "0149_folder_download_component_kind"
down_revision = "0148_multiple_active_platform_storage_mappings"
branch_labels = None
depends_on = None


def _component_kind(*, include_folder: bool) -> sa.Enum:
    values = [
        "base",
        "update",
        "dlc",
        "hotfix",
        "language_pack",
        "extra",
        "unresolved",
    ]
    if include_folder:
        values.append("folder")
    return sa.Enum(*values, name="romcomponentkind")


def upgrade() -> None:
    connection = op.get_bind()
    if is_postgresql(connection):
        with op.get_context().autocommit_block():
            op.execute("ALTER TYPE romcomponentkind ADD VALUE IF NOT EXISTS 'folder'")
        return
    with op.batch_alter_table("rom_components") as batch_op:
        batch_op.alter_column("kind", type_=_component_kind(include_folder=True))


def downgrade() -> None:
    if is_postgresql(op.get_bind()):
        return
    with op.batch_alter_table("rom_components") as batch_op:
        batch_op.alter_column("kind", type_=_component_kind(include_folder=False))

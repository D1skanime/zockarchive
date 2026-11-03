"""Add independent DLC manuals and separate media display surfaces.

Revision ID: 0139_pc_component_owned_media_surfaces
Revises: 0138_rom_metadata_facet_roles_view
"""

import sqlalchemy as sa
from alembic import op

revision = "0139_pc_component_owned_media_surfaces"
down_revision = "0138_rom_metadata_facet_roles_view"
branch_labels = None
depends_on = None

_TABLE = "rom_component_owned_media_placements"


def upgrade() -> None:
    op.add_column(
        "rom_components", sa.Column("manual_path", sa.Text(), nullable=True)
    )
    op.add_column(
        _TABLE,
        sa.Column(
            "surface",
            sa.String(length=20),
            nullable=False,
            server_default="overview",
        ),
    )
    op.drop_constraint("uq_rom_component_owned_media_placements_media", _TABLE)
    op.drop_constraint("uq_rom_component_owned_media_placements_position", _TABLE)
    op.drop_index("idx_rom_component_owned_media_placements_component_position", _TABLE)
    op.create_check_constraint(
        "ck_rom_component_owned_media_placements_surface",
        _TABLE,
        "surface IN ('overview', 'background', 'soundtrack')",
    )
    op.create_unique_constraint(
        "uq_rom_component_owned_media_placements_media_surface",
        _TABLE,
        ["media_id", "surface"],
    )
    op.create_unique_constraint(
        "uq_rom_component_owned_media_placements_component_surface_position",
        _TABLE,
        ["component_id", "surface", "position"],
    )
    op.create_index(
        "idx_rom_component_owned_media_placements_component_surface_position",
        _TABLE,
        ["component_id", "surface", "position"],
    )


def downgrade() -> None:
    op.drop_index(
        "idx_rom_component_owned_media_placements_component_surface_position",
        table_name=_TABLE,
    )
    op.drop_constraint(
        "uq_rom_component_owned_media_placements_component_surface_position", _TABLE
    )
    op.drop_constraint("uq_rom_component_owned_media_placements_media_surface", _TABLE)
    op.drop_constraint("ck_rom_component_owned_media_placements_surface", _TABLE)
    op.create_unique_constraint(
        "uq_rom_component_owned_media_placements_media", _TABLE, ["component_id", "media_id"]
    )
    op.create_unique_constraint(
        "uq_rom_component_owned_media_placements_position", _TABLE, ["component_id", "position"]
    )
    op.create_index(
        "idx_rom_component_owned_media_placements_component_position",
        _TABLE,
        ["component_id", "position"],
    )
    op.drop_column(_TABLE, "surface")
    op.drop_column("rom_components", "manual_path")

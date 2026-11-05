"""Keep selectable owned cover candidates for ROMs and managed components.

Revision ID: 0144_active_cover_candidates
Revises: 0139_pc_component_owned_media_surfaces, 0143_save_backups
"""

import sqlalchemy as sa
from alembic import op

revision = "0144_active_cover_candidates"
down_revision = ("0139_pc_component_owned_media_surfaces", "0143_save_backups")
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint("romownedmediarole", "rom_owned_media", type_="check")
    op.create_check_constraint(
        "romownedmediarole",
        "rom_owned_media",
        "role IN ('cover', 'screenshot', 'artwork', 'soundtrack')",
    )
    op.add_column(
        "roms",
        sa.Column("active_owned_cover_media_id", sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        "fk_roms_active_owned_cover_media",
        "roms",
        "rom_owned_media",
        ["active_owned_cover_media_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.add_column(
        "rom_components",
        sa.Column("active_owned_cover_media_id", sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        "fk_rom_components_active_owned_cover_media",
        "rom_components",
        "rom_component_owned_media",
        ["active_owned_cover_media_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_rom_components_active_owned_cover_media",
        "rom_components",
        type_="foreignkey",
    )
    op.drop_column("rom_components", "active_owned_cover_media_id")
    op.drop_constraint("fk_roms_active_owned_cover_media", "roms", type_="foreignkey")
    op.drop_column("roms", "active_owned_cover_media_id")
    op.drop_constraint("romownedmediarole", "rom_owned_media", type_="check")
    op.create_check_constraint(
        "romownedmediarole",
        "rom_owned_media",
        "role IN ('screenshot', 'artwork', 'soundtrack')",
    )

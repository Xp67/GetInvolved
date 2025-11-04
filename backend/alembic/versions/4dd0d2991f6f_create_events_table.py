"""create events table

Revision ID: 4dd0d2991f6f
Revises: e3962215fddb
Create Date: 2025-01-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4dd0d2991f6f"
down_revision: Union[str, Sequence[str], None] = "e3962215fddb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "events",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("start_datetime", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_datetime", sa.DateTime(timezone=True), nullable=True),
        sa.Column("organizer", sa.String(length=255), nullable=True),
        sa.Column("capacity", sa.Integer(), nullable=True),
        sa.Column("category", sa.String(length=100), nullable=True),
        sa.Column(
            "is_virtual",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.Column("registration_link", sa.String(length=512), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_events_id", "events", ["id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index("ix_events_id", table_name="events")
    op.drop_table("events")

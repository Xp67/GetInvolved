"""init

Revision ID: e3962215fddb
Revises: dbbb447e01ad
Create Date: 2025-11-03 11:05:39.516928

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e3962215fddb'
down_revision: Union[str, Sequence[str], None] = 'dbbb447e01ad'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

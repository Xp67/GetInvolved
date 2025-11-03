"""SQLAlchemy base metadata registration."""
from sqlalchemy.orm import declarative_base


Base = declarative_base()


# Import models here so Alembic can discover them via Base.metadata.
try:  # pragma: no cover - defensive import for Alembic migrations
    from app.models import event  # noqa: F401
except Exception:  # pragma: no cover - avoid hard failure during runtime import
    event = None

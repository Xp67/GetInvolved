"""Health and status endpoints."""
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.schemas.health import HealthStatus


def _serialize_health(status: HealthStatus) -> dict[str, bool]:
    """Return a plain dictionary regardless of pydantic major version."""

    if hasattr(status, "model_dump"):
        return status.model_dump()
    return status.dict()

router = APIRouter()


@router.get("/health", summary="Health check", response_model=HealthStatus)
def health() -> JSONResponse:
    """Return application liveness indicator."""
    status = HealthStatus()
    return JSONResponse(_serialize_health(status))

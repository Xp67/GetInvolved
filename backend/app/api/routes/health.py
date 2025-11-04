"""Health and status endpoints."""
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.schemas.health import HealthStatus

router = APIRouter()


@router.get("/health", summary="Health check", response_model=HealthStatus)
def health() -> JSONResponse:
    """Return application liveness indicator."""
    status = HealthStatus()
    return JSONResponse(status.model_dump())

"""Pydantic models for system health endpoints."""
from pydantic import BaseModel


class HealthStatus(BaseModel):
    """Basic liveness response."""

    ok: bool = True

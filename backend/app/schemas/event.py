"""Pydantic models describing event payloads."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

try:  # pragma: no cover - compatibility with pydantic v1
    from pydantic import BaseModel, ConfigDict, Field, HttpUrl
except ImportError:  # pragma: no cover
    from pydantic import BaseModel, Field, HttpUrl  # type: ignore

    ConfigDict = None  # type: ignore


def _model_dump(model: BaseModel) -> Dict[str, Any]:
    """Return plain data regardless of installed Pydantic version."""

    if hasattr(model, "model_dump"):
        return model.model_dump()
    return model.dict()  # type: ignore[return-value]


class EventBase(BaseModel):
    """Shared properties for event objects."""

    title: str = Field(..., max_length=255)
    description: str | None = Field(None, max_length=5000)
    location: str | None = Field(None, max_length=255)
    start_datetime: datetime
    end_datetime: datetime | None = None
    organizer: str | None = Field(None, max_length=255)
    capacity: int | None = Field(None, ge=0)
    category: str | None = Field(None, max_length=100)
    is_virtual: bool = False
    registration_link: HttpUrl | None = None


class EventCreate(EventBase):
    """Payload for creating a new event."""


class EventRead(EventBase):
    """Data returned by the API for an event."""

    id: int
    created_at: datetime
    updated_at: datetime

    if "ConfigDict" in globals() and ConfigDict is not None:  # pragma: no branch
        model_config = ConfigDict(from_attributes=True)
    else:  # pragma: no cover - only executed on pydantic v1
        class Config:  # type: ignore[no-redef]
            orm_mode = True


__all__ = [
    "EventBase",
    "EventCreate",
    "EventRead",
    "_model_dump",
]

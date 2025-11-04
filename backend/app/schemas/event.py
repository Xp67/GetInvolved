"""Pydantic models describing event payloads."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


def _model_dump(model: BaseModel) -> Dict[str, Any]:
    """Return plain data using Pydantic v2 API."""
    return model.model_dump()


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

    model_config = ConfigDict(from_attributes=True)


__all__ = [
    "EventBase",
    "EventCreate",
    "EventRead",
    "_model_dump",
]

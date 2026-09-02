"""Pydantic schemas for resume upload responses."""

from datetime import datetime

from pydantic import BaseModel


class ResumeOut(BaseModel):
    id: int
    filename: str
    created_at: datetime

    class Config:
        from_attributes = True

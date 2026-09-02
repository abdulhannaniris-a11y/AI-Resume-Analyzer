"""Pydantic schemas for job descriptions."""

from typing import List
from datetime import datetime

from pydantic import BaseModel


class JobDescriptionIn(BaseModel):
    title: str
    description: str


class JobDescriptionOut(BaseModel):
    id: int
    title: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True


class ExtractedJobInfo(BaseModel):
    """Structured information the AI extracts from a job description."""

    job_title: str = ""
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    experience_requirements: List[str] = []
    education_requirements: List[str] = []
    responsibilities: List[str] = []
    keywords: List[str] = []

"""Pydantic schemas for the analyze endpoint and analysis results."""

from typing import List, Dict, Any, Union
from datetime import datetime

from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    resume_id: int
    job_title: str
    job_description: str


class ExtractedResumeInfo(BaseModel):
    """Structured information the AI extracts from a resume."""

    name: str = ""
    summary: str = ""
    skills: List[str] = []
    # Updated to handle both raw strings and dictionary objects from Groq
    education: List[Union[str, Dict[str, Any]]] = []
    experience: List[Union[str, Dict[str, Any]]] = []
    projects: List[Union[str, Dict[str, Any]]] = []
    certifications: List[Union[str, Dict[str, Any]]] = []
    achievements: List[Union[str, Dict[str, Any]]] = []


class ScoreBreakdown(BaseModel):
    overall_score: float
    skills_score: float
    experience_score: float
    keyword_score: float
    education_score: float
    projects_score: float
    quality_score: float


class AnalysisResult(BaseModel):
    """
    The full structured result shown on the results page.
    This entire object is also stored as JSON in the `analyses.analysis_result`
    column so the whole page can be reconstructed later from history.
    """

    scores: ScoreBreakdown
    matched_skills: List[str]
    missing_skills: List[str]
    matched_keywords: List[str]
    missing_keywords: List[str]
    experience_analysis: str
    education_analysis: str
    projects_analysis: str
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]


class AnalysisOut(BaseModel):
    id: int
    resume_id: int
    job_description_id: int
    job_title: str
    resume_filename: str
    overall_score: float
    created_at: datetime
    analysis_result: Dict

    class Config:
        from_attributes = True


class AnalysisListItem(BaseModel):
    """Lightweight shape used for the analysis history list."""

    id: int
    job_title: str
    resume_filename: str
    overall_score: float
    created_at: datetime
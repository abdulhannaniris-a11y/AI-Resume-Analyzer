"""SQLAlchemy model for a completed resume-vs-job analysis."""

from datetime import datetime, timezone

from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.db.session import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=False)

    overall_score = Column(Float, nullable=False)
    skills_score = Column(Float, nullable=False)
    experience_score = Column(Float, nullable=False)
    keyword_score = Column(Float, nullable=False)
    education_score = Column(Float, nullable=False)
    projects_score = Column(Float, nullable=False)
    quality_score = Column(Float, nullable=False)

    # Full structured analysis (matched/missing skills, strengths,
    # weaknesses, recommendations, etc.) stored as JSON so the frontend
    # can render the entire results page from one field.
    analysis_result = Column(JSON, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="analyses")
    resume = relationship("Resume", back_populates="analyses")
    job_description = relationship("JobDescription", back_populates="analyses")

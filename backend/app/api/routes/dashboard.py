"""Dashboard summary route used by the frontend dashboard page."""

from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.analysis import Analysis
from app.models.user import User
from app.schemas.analysis import AnalysisListItem

router = APIRouter()


class DashboardSummary(BaseModel):
    total_analyses: int
    average_score: Optional[float]
    best_score: Optional[float]
    recent_analyses: List[AnalysisListItem]


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Aggregate stats for the dashboard: totals, average/best score, recent list."""
    analyses = (
        db.query(Analysis)
        .filter(Analysis.user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .all()
    )

    total = len(analyses)
    average_score = round(sum(a.overall_score for a in analyses) / total, 2) if total else None
    best_score = max((a.overall_score for a in analyses), default=None)

    recent = [
        AnalysisListItem(
            id=a.id,
            job_title=a.job_description.title,
            resume_filename=a.resume.filename,
            overall_score=a.overall_score,
            created_at=a.created_at,
        )
        for a in analyses[:5]
    ]

    return DashboardSummary(
        total_analyses=total,
        average_score=average_score,
        best_score=best_score,
        recent_analyses=recent,
    )

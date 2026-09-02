"""Routes for viewing past analyses (history + detail)."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.analysis import Analysis
from app.models.user import User
from app.schemas.analysis import AnalysisListItem, AnalysisOut

router = APIRouter()


@router.get("", response_model=List[AnalysisListItem])
def list_analyses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the current user's analysis history, most recent first."""
    analyses = (
        db.query(Analysis)
        .filter(Analysis.user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .all()
    )

    return [
        AnalysisListItem(
            id=a.id,
            job_title=a.job_description.title,
            resume_filename=a.resume.filename,
            overall_score=a.overall_score,
            created_at=a.created_at,
        )
        for a in analyses
    ]


@router.get("/{analysis_id}", response_model=AnalysisOut)
def get_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the full stored result for a single analysis."""
    analysis = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found.")

    return AnalysisOut(
        id=analysis.id,
        resume_id=analysis.resume_id,
        job_description_id=analysis.job_description_id,
        job_title=analysis.job_description.title,
        resume_filename=analysis.resume.filename,
        overall_score=analysis.overall_score,
        created_at=analysis.created_at,
        analysis_result=analysis.analysis_result,
    )

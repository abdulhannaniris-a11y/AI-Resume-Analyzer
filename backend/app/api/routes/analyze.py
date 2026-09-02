"""
The core /analyze endpoint: takes a previously-uploaded resume and a
job description, then runs the full pipeline:

  1. Extract structured info from the resume (Groq)
  2. Extract structured info from the job description (Groq)
  3. Match skills/experience/education/projects/keywords
     (rule-based + semantic)
  4. Calculate the final ATS score (Python, deterministic)
  5. Generate qualitative strengths/weaknesses/recommendations (Groq)
  6. Save everything to the database
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.analysis import Analysis
from app.models.job_description import JobDescription
from app.models.resume import Resume
from app.models.user import User
from app.schemas.analysis import AnalysisOut, AnalyzeRequest
from app.services.ai_extraction import extract_job_info, extract_resume_info
from app.services.groq_client import GroqServiceError
from app.services.matching import combined_match
from app.services.recommendations import generate_qualitative_analysis
from app.services.scoring import calculate_scores, score_resume_quality

router = APIRouter()


@router.post("", response_model=AnalysisOut, status_code=status.HTTP_201_CREATED)
def analyze_resume(
    payload: AnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == payload.resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    if not payload.job_description or not payload.job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description cannot be empty.",
        )

    # Save the job description first so we have an id to attach to the analysis.
    job_description = JobDescription(
        user_id=current_user.id,
        title=payload.job_title or "Untitled Job",
        description=payload.job_description,
    )
    db.add(job_description)
    db.commit()
    db.refresh(job_description)

    try:
        resume_info = extract_resume_info(resume.extracted_text)
        job_info = extract_job_info(payload.job_title, payload.job_description)
    except GroqServiceError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc))

    # --- Matching ---
    matched_skills, missing_skills = combined_match(resume_info.skills, job_info.required_skills)
    matched_keywords, missing_keywords = combined_match(
        resume_info.skills + resume_info.experience + resume_info.projects,
        job_info.keywords,
    )
    matched_experience, _ = combined_match(resume_info.experience, job_info.experience_requirements)
    matched_education, _ = combined_match(resume_info.education, job_info.education_requirements)
    matched_projects, _ = combined_match(resume_info.projects, job_info.responsibilities)

    sections_present = sum(
        1
        for section in [
            resume_info.summary,
            resume_info.skills,
            resume_info.education,
            resume_info.experience,
            resume_info.projects,
            resume_info.certifications + resume_info.achievements,
        ]
        if section
    )
    quality_score = score_resume_quality(resume.extracted_text, sections_present)

    # --- Scoring (always computed in Python, never by the LLM) ---
    scores = calculate_scores(
        matched_skills=matched_skills,
        required_skills=job_info.required_skills,
        matched_experience=matched_experience,
        experience_requirements=job_info.experience_requirements,
        matched_keywords=matched_keywords,
        keywords=job_info.keywords,
        matched_education=matched_education,
        education_requirements=job_info.education_requirements,
        matched_projects_relevance=matched_projects,
        responsibilities=job_info.responsibilities,
        resume_quality_score=quality_score,
    )

    # --- Qualitative AI analysis ---
    try:
        qualitative = generate_qualitative_analysis(
            resume_summary=resume_info.summary,
            resume_skills=resume_info.skills,
            resume_experience=resume_info.experience,
            resume_education=resume_info.education,
            resume_projects=resume_info.projects,
            job_title=job_info.job_title,
            job_responsibilities=job_info.responsibilities,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
        )
    except GroqServiceError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc))

    analysis_result = {
        "scores": scores.model_dump(),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "experience_analysis": qualitative.get("experience_analysis", ""),
        "education_analysis": qualitative.get("education_analysis", ""),
        "projects_analysis": qualitative.get("projects_analysis", ""),
        "strengths": qualitative.get("strengths", []),
        "weaknesses": qualitative.get("weaknesses", []),
        "recommendations": qualitative.get("recommendations", []),
    }

    analysis = Analysis(
        user_id=current_user.id,
        resume_id=resume.id,
        job_description_id=job_description.id,
        overall_score=scores.overall_score,
        skills_score=scores.skills_score,
        experience_score=scores.experience_score,
        keyword_score=scores.keyword_score,
        education_score=scores.education_score,
        projects_score=scores.projects_score,
        quality_score=scores.quality_score,
        analysis_result=analysis_result,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return AnalysisOut(
        id=analysis.id,
        resume_id=resume.id,
        job_description_id=job_description.id,
        job_title=job_description.title,
        resume_filename=resume.filename,
        overall_score=analysis.overall_score,
        created_at=analysis.created_at,
        analysis_result=analysis.analysis_result,
    )

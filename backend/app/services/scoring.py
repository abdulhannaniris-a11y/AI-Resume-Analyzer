"""
ATS-style scoring system.

IMPORTANT: The final numerical score is always calculated here in
Python — the LLM is never allowed to invent the score. This keeps
scoring deterministic, auditable, and easy to tune.

To change the weighting, edit SCORE_WEIGHTS below. They should sum to 1.0.
"""

from typing import List

from app.schemas.analysis import ScoreBreakdown

SCORE_WEIGHTS = {
    "skills": 0.35,
    "experience": 0.25,
    "keywords": 0.15,
    "education": 0.10,
    "projects": 0.10,
    "quality": 0.05,
}


def _match_ratio(matched: List[str], total: List[str]) -> float:
    """Return the fraction (0-100) of `total` items that were matched."""
    if not total:
        # If the job listed no requirements in this category, treat it as
        # fully satisfied rather than penalizing the resume.
        return 100.0
    return round((len(matched) / len(total)) * 100, 2)


def score_resume_quality(resume_text: str, extracted_sections_present: int) -> float:
    """
    A simple heuristic resume-quality score (0-100) based on length and
    how many structured sections (summary, skills, education, experience,
    projects, etc.) were actually found in the resume. This is
    intentionally simple and easy to extend later.
    """
    word_count = len(resume_text.split())

    length_score = 100.0
    if word_count < 150:
        length_score = 40.0
    elif word_count < 300:
        length_score = 70.0
    elif word_count > 1200:
        length_score = 80.0

    # extracted_sections_present is expected to be 0-6 (summary, skills,
    # education, experience, projects, certifications/achievements).
    section_score = min(extracted_sections_present / 6 * 100, 100.0)

    return round((length_score * 0.5) + (section_score * 0.5), 2)


def calculate_scores(
    matched_skills: List[str],
    required_skills: List[str],
    matched_experience: List[str],
    experience_requirements: List[str],
    matched_keywords: List[str],
    keywords: List[str],
    matched_education: List[str],
    education_requirements: List[str],
    matched_projects_relevance: List[str],
    responsibilities: List[str],
    resume_quality_score: float,
) -> ScoreBreakdown:
    """
    Compute each category score (0-100) plus the final weighted overall
    score (0-100), using the fixed weights in SCORE_WEIGHTS.
    """
    skills_score = _match_ratio(matched_skills, required_skills)
    experience_score = _match_ratio(matched_experience, experience_requirements)
    keyword_score = _match_ratio(matched_keywords, keywords)
    education_score = _match_ratio(matched_education, education_requirements)
    projects_score = _match_ratio(matched_projects_relevance, responsibilities)
    quality_score = round(resume_quality_score, 2)

    overall = (
        skills_score * SCORE_WEIGHTS["skills"]
        + experience_score * SCORE_WEIGHTS["experience"]
        + keyword_score * SCORE_WEIGHTS["keywords"]
        + education_score * SCORE_WEIGHTS["education"]
        + projects_score * SCORE_WEIGHTS["projects"]
        + quality_score * SCORE_WEIGHTS["quality"]
    )
    overall = round(min(max(overall, 0), 100), 2)

    return ScoreBreakdown(
        overall_score=overall,
        skills_score=skills_score,
        experience_score=experience_score,
        keyword_score=keyword_score,
        education_score=education_score,
        projects_score=projects_score,
        quality_score=quality_score,
    )

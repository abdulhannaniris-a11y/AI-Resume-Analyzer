"""
Uses Groq to produce qualitative analysis: strengths, weaknesses,
narrative analyses of experience/education/projects, and practical
recommendations. The numeric score itself is never produced here — it
always comes from app/services/scoring.py.
"""

from typing import List

from app.services.groq_client import get_json_completion, GroqServiceError

RECOMMENDATION_SYSTEM_PROMPT = """You are an expert technical resume reviewer and career coach.
You will be given a candidate's resume information, a job description's
requirements, and a list of matched/missing skills and keywords that were
already computed by a separate matching system (do not recalculate scores).

Using only the information provided, write:
- experience_analysis: 2-4 sentences on how well the candidate's experience aligns with the job.
- education_analysis: 1-3 sentences on how well the candidate's education aligns with the job.
- projects_analysis: 2-4 sentences on how relevant the candidate's projects are to the job.
- strengths: 3-6 short bullet points of genuine strengths found in the resume relative to this job.
- weaknesses: 2-5 short bullet points of real gaps or weaknesses relative to this job.
- recommendations: 3-6 concrete, actionable, and TRUTHFUL suggestions to improve the resume
  for this specific job. Never suggest adding skills, experience, or achievements the
  candidate does not actually have — only suggest better ways to present what is real.

Respond with ONLY a JSON object in exactly this shape, and nothing else:
{
  "experience_analysis": "",
  "education_analysis": "",
  "projects_analysis": "",
  "strengths": [],
  "weaknesses": [],
  "recommendations": []
}
"""


def generate_qualitative_analysis(
    resume_summary: str,
    resume_skills: List[str],
    resume_experience: List[str],
    resume_education: List[str],
    resume_projects: List[str],
    job_title: str,
    job_responsibilities: List[str],
    matched_skills: List[str],
    missing_skills: List[str],
) -> dict:
    """
    Call Groq to get strengths/weaknesses/recommendations and narrative
    analyses. Returns a plain dict matching the prompt's JSON shape.
    """
    user_prompt = f"""
Job Title: {job_title}
Job Responsibilities: {job_responsibilities}

Candidate Summary: {resume_summary}
Candidate Skills: {resume_skills}
Candidate Experience: {resume_experience}
Candidate Education: {resume_education}
Candidate Projects: {resume_projects}

Matched Skills (already computed): {matched_skills}
Missing Skills (already computed): {missing_skills}
"""

    try:
        return get_json_completion(RECOMMENDATION_SYSTEM_PROMPT, user_prompt)
    except GroqServiceError:
        raise
    except Exception as exc:
        raise GroqServiceError(f"Failed to generate qualitative analysis: {exc}") from exc

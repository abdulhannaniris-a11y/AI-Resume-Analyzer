"""
Uses Groq to extract structured information from resume text and job
description text. The model is explicitly instructed to only report
information that is actually present in the source text — never to
invent skills, experience, or qualifications.
"""

from app.schemas.analysis import ExtractedResumeInfo
from app.schemas.job_description import ExtractedJobInfo
from app.services.groq_client import get_json_completion, GroqServiceError

RESUME_EXTRACTION_SYSTEM_PROMPT = """You are a precise resume-parsing assistant.
Extract ONLY information that is explicitly present in the resume text provided.
Do NOT invent, infer, assume, or embellish any skill, job title, degree,
project, certification, or achievement that is not clearly stated.
If a field has no information in the resume, return an empty string or empty list.

Respond with ONLY a JSON object in exactly this shape, and nothing else:
{
  "name": "",
  "summary": "",
  "skills": [],
  "education": [],
  "experience": [],
  "projects": [],
  "certifications": [],
  "achievements": []
}
"""

JOB_EXTRACTION_SYSTEM_PROMPT = """You are a precise job-description-parsing assistant.
Extract ONLY information that is explicitly present in the job description text provided.
Do not invent requirements that are not stated or clearly implied by the text.

Respond with ONLY a JSON object in exactly this shape, and nothing else:
{
  "job_title": "",
  "required_skills": [],
  "preferred_skills": [],
  "experience_requirements": [],
  "education_requirements": [],
  "responsibilities": [],
  "keywords": []
}
"""


def extract_resume_info(resume_text: str) -> ExtractedResumeInfo:
    """Extract structured resume data using Groq. Raises GroqServiceError on failure."""
    try:
        data = get_json_completion(RESUME_EXTRACTION_SYSTEM_PROMPT, resume_text)
        return ExtractedResumeInfo(**data)
    except GroqServiceError:
        raise
    except Exception as exc:
        raise GroqServiceError(f"Failed to parse resume extraction result: {exc}") from exc


def extract_job_info(job_title: str, job_description_text: str) -> ExtractedJobInfo:
    """Extract structured job-requirement data using Groq. Raises GroqServiceError on failure."""
    prompt = f"Job Title (if provided by user): {job_title}\n\nJob Description:\n{job_description_text}"
    try:
        data = get_json_completion(JOB_EXTRACTION_SYSTEM_PROMPT, prompt)
        # Prefer the user-supplied title if the model didn't find one.
        if not data.get("job_title"):
            data["job_title"] = job_title
        return ExtractedJobInfo(**data)
    except GroqServiceError:
        raise
    except Exception as exc:
        raise GroqServiceError(f"Failed to parse job extraction result: {exc}") from exc

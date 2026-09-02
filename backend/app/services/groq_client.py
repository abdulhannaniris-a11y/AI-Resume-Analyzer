"""
Thin wrapper around the Groq API.

Keeps all Groq-specific setup (client creation, JSON-mode calls, error
handling) in one place so the rest of the app doesn't need to know
about the Groq SDK directly.
"""

import json
from typing import Any, Dict

from app.core.config import settings


class GroqServiceError(Exception):
    """Raised when the Groq API call fails or returns unusable output."""


def _get_client():
    try:
        from groq import Groq
    except ImportError as exc:
        raise GroqServiceError("Groq SDK is not installed.") from exc

    if not settings.GROQ_API_KEY:
        raise GroqServiceError(
            "GROQ_API_KEY is not set. Add it to your .env file."
        )

    return Groq(api_key=settings.GROQ_API_KEY)


def get_json_completion(system_prompt: str, user_prompt: str) -> Dict[str, Any]:
    """
    Send a system + user prompt to Groq and parse the response as JSON.

    The system prompt should instruct the model to respond with JSON only.
    Raises GroqServiceError on any API failure or invalid JSON response.
    """
    client = _get_client()

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
            response_format={"type": "json_object"},
        )
    except Exception as exc:
        raise GroqServiceError(f"Groq API request failed: {exc}") from exc

    raw_content = response.choices[0].message.content

    try:
        return json.loads(raw_content)
    except (json.JSONDecodeError, TypeError) as exc:
        raise GroqServiceError(
            f"Groq returned a response that could not be parsed as JSON: {exc}"
        ) from exc

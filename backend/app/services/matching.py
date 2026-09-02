"""
Resume-vs-job matching logic.

Two layers:
1. Rule-based exact/substring matching for skills and keywords.
2. Semantic similarity (Sentence Transformers + FAISS) to catch skills
   that are phrased differently but mean the same thing
   (e.g. "REST APIs" vs "RESTful web services").

The sentence-transformers model is loaded lazily and cached at module
level so it's only downloaded/loaded once per server process, and only
when matching is actually needed (not at import time).
"""

from typing import List, Tuple, Any
import re

_model = None  # cached SentenceTransformer instance


def _normalize(text: Any) -> str:
    """Normalize input text, safely handling dictionaries, non-strings, and None values."""
    if text is None:
        return ""

    # Convert dictionary objects to flattened text strings
    if isinstance(text, dict):
        text = " ".join(str(v) for v in text.values() if v)
    elif not isinstance(text, str):
        text = str(text)

    return re.sub(r"\s+", " ", text.strip().lower())


def rule_based_match(resume_items: List[Any], job_items: List[Any]) -> Tuple[List[str], List[str]]:
    """
    Exact/substring matching between two lists of items.
    Returns (matched, missing) using the job's items as the reference list.
    """
    normalized_resume = [_normalize(item) for item in resume_items if _normalize(item)]
    resume_blob = " ".join(normalized_resume)

    matched, missing = [], []
    seen = set()

    for job_item in job_items:
        norm = _normalize(job_item)
        if not norm or norm in seen:
            continue
        seen.add(norm)

        is_match = norm in normalized_resume or norm in resume_blob or any(
            norm in r or r in norm for r in normalized_resume
        )
        if is_match:
            matched.append(str(job_item))
        else:
            missing.append(str(job_item))

    return matched, missing


def _get_model():
    """Lazily load and cache the sentence-transformers model."""
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer

        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def semantic_match(
    resume_items: List[Any],
    job_items: List[Any],
    threshold: float = 0.55,
) -> Tuple[List[str], List[str]]:
    """
    Use sentence embeddings + FAISS to find job items that are
    semantically similar to something in the resume.
    """
    # Pre-process all items into clean string representations for vector encoding
    str_resume = [_normalize(item) for item in resume_items if _normalize(item)]
    str_job = [_normalize(item) for item in job_items if _normalize(item)]

    if not str_resume or not str_job:
        return [], [str(j) for j in job_items]

    try:
        import numpy as np
        import faiss

        model = _get_model()

        resume_embeddings = model.encode(str_resume, normalize_embeddings=True)
        job_embeddings = model.encode(str_job, normalize_embeddings=True)

        dimension = resume_embeddings.shape[1]
        index = faiss.IndexFlatIP(dimension)  # inner product == cosine sim (normalized vectors)
        index.add(np.array(resume_embeddings).astype("float32"))

        matched, missing = [], []
        query = np.array(job_embeddings).astype("float32")
        scores, _ = index.search(query, k=1)

        for raw_job_item, score in zip(job_items, scores[:, 0]):
            job_str = str(raw_job_item)
            if score >= threshold:
                matched.append(job_str)
            else:
                missing.append(job_str)

        return matched, missing

    except ImportError:
        # ML libraries not installed — fallback to rule-based matching output
        return [], [str(j) for j in job_items]


def combined_match(resume_items: List[Any], job_items: List[Any]) -> Tuple[List[str], List[str]]:
    """
    Combine rule-based and semantic matching. An item counts as matched
    if either layer finds a match. Order of `job_items` is preserved.
    """
    rule_matched, rule_missing = rule_based_match(resume_items, job_items)

    if not rule_missing:
        return rule_matched, []

    semantic_matched, still_missing = semantic_match(resume_items, rule_missing)

    matched = rule_matched + semantic_matched
    # Preserve original job_items order in the final matched/missing lists.
    matched_set = set(_normalize(m) for m in matched)
    ordered_matched = [str(j) for j in job_items if _normalize(j) in matched_set]
    ordered_missing = [str(j) for j in job_items if _normalize(j) not in matched_set]

    return ordered_matched, ordered_missing
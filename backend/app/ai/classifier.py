"""
High-level entry point: raw email in, validated structured result out.

Validates the model's JSON against a strict schema and retries once on
failure. If it still fails, returns an "uncategorized" result rather
than raising — a bad AI call should never take down the sync job.
"""
from datetime import datetime, date
from typing import Optional

from pydantic import BaseModel, ValidationError, field_validator

from app.ai.ollama_client import generate_json, OllamaError
from app.ai.prompts import build_classify_prompt, CATEGORIES


class ClassificationResult(BaseModel):
    category: str
    confidence: float = 0.0
    company: Optional[str] = None
    role: Optional[str] = None
    event_type: Optional[str] = None
    event_date: Optional[date] = None

    @field_validator("category")
    @classmethod
    def category_must_be_known(cls, v):
        # "uncategorized" is allowed through here too — it's the fallback
        # value classify_email() uses when the model call fails entirely.
        allowed = CATEGORIES + ["uncategorized"]
        return v if v in allowed else "not_job_related"


def classify_email(subject: str, sender: str, body: str) -> ClassificationResult:
    prompt = build_classify_prompt(subject, sender, body)

    for attempt in range(2):
        try:
            raw = generate_json(prompt)
            return ClassificationResult(**raw)
        except (OllamaError, ValidationError):
            if attempt == 1:
                break
            continue

    # Both attempts failed — don't block the sync, just flag it as
    # uncategorized so it shows up in the inbox feed for manual review.
    return ClassificationResult(category="uncategorized", confidence=0.0)

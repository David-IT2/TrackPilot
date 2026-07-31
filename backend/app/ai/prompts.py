"""
Prompt templates for the local model.

One combined prompt (classify + extract in a single call) is used by
default — cheaper than two calls. If you find the model unreliable on
multi-field JSON, split this into a classify-first / extract-only-if-
job-related two-stage pipeline (call generate_json twice instead).
"""

CATEGORIES = [
    "application_confirmation",
    "interview_invite",
    "assessment",
    "rejection",
    "offer",
    "not_job_related",
]

CLASSIFY_AND_EXTRACT_PROMPT = """You are classifying an email for a personal job-application tracker.

Read the email below and respond with ONLY a JSON object (no other text) in exactly this shape:

{{
  "category": one of {categories},
  "confidence": a number between 0 and 1,
  "company": the hiring company's name, or null if not identifiable,
  "role": the job title being discussed, or null if not identifiable,
  "event_type": one of "interview", "deadline", "follow_up", "other", or null if no date is mentioned,
  "event_date": an ISO 8601 date (YYYY-MM-DD) if a specific date/deadline/interview time is mentioned, else null
}}

Rules:
- If the email is not related to a job application at all (newsletters, unrelated personal email, spam), category must be "not_job_related" and all other fields null.
- Only extract event_date if a real date is stated or clearly implied (e.g. "interview on July 30th"). Do not guess.
- company and role should be short, e.g. "Pesapal" and "Sales Representative", not full sentences.

Email subject: {subject}
Email sender: {sender}
Email body:
{body}
"""


def build_classify_prompt(subject: str, sender: str, body: str) -> str:
    # Truncate long bodies — most of what we need is in the first ~2000 chars,
    # and it keeps the local model fast.
    trimmed_body = (body or "")[:2000]
    return CLASSIFY_AND_EXTRACT_PROMPT.format(
        categories=CATEGORIES, subject=subject, sender=sender, body=trimmed_body
    )

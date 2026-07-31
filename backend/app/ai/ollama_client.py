"""
Thin wrapper around a local Ollama server.

Requires Ollama running (`ollama serve`, usually started automatically
by the desktop app) and the model pulled: `ollama pull llama3.1:8b`.
"""
import json
import httpx

from app.core.config import settings


class OllamaError(Exception):
    pass


def generate_json(prompt: str, timeout: float = 60.0) -> dict:
    """
    Call Ollama with format="json" so the model is constrained to valid
    JSON output, then parse it. Raises OllamaError if the model returns
    something that doesn't parse — callers should catch this and either
    retry once or flag the email for manual review rather than crash.
    """
    url = f"{settings.ollama_host}/api/generate"
    payload = {
        "model": settings.ollama_model,
        "prompt": prompt,
        "format": "json",
        "stream": False,
        "options": {"temperature": 0.1},
    }
    try:
        resp = httpx.post(url, json=payload, timeout=timeout)
        resp.raise_for_status()
    except httpx.HTTPError as e:
        raise OllamaError(f"Could not reach Ollama at {settings.ollama_host}: {e}")

    raw_text = resp.json().get("response", "")
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError as e:
        raise OllamaError(f"Ollama returned invalid JSON: {raw_text!r}") from e

"""
Thin wrapper around the Gmail API.

Auth flow: run `scripts/gmail_auth.py` once, interactively, to produce
`token.json` (see README). This module just loads that token and
refreshes it silently on expiry.
"""
import base64
import os
from datetime import datetime
from typing import Optional

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from app.core.config import settings

# Read-only is all this app needs. If you later want to auto-archive or
# label emails, add "https://www.googleapis.com/auth/gmail.modify" and
# re-run scripts/gmail_auth.py to re-consent.
SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]


def get_credentials() -> Credentials:
    if not os.path.exists(settings.gmail_token_file):
        raise RuntimeError(
            f"No token file at {settings.gmail_token_file}. "
            "Run `python scripts/gmail_auth.py` first."
        )
    creds = Credentials.from_authorized_user_file(settings.gmail_token_file, SCOPES)
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        with open(settings.gmail_token_file, "w") as f:
            f.write(creds.to_json())
    return creds


def get_service():
    creds = get_credentials()
    return build("gmail", "v1", credentials=creds, cache_discovery=False)


def list_message_ids(service, query: str = "", page_token: Optional[str] = None,
                      max_results: int = 50):
    """
    List message ids matching a Gmail search query.
    Default query is empty (all mail) — narrow this in sync.py, e.g. to
    a label or a date range, so you're not ingesting your entire inbox.
    """
    resp = service.users().messages().list(
        userId="me", q=query, pageToken=page_token, maxResults=max_results
    ).execute()
    return resp.get("messages", []), resp.get("nextPageToken")


def get_message(service, message_id: str) -> dict:
    """Fetch a single message with headers + plain text body."""
    raw = service.users().messages().get(
        userId="me", id=message_id, format="full"
    ).execute()
    return _parse_message(raw)


def get_history(service, start_history_id: str):
    """
    Incremental sync: get everything that changed since start_history_id.
    Returns a list of new message ids. Falls back to a full resync if
    the history id is too old (Gmail expires history after ~7 days).
    """
    message_ids = []
    page_token = None
    try:
        while True:
            resp = service.users().history().list(
                userId="me",
                startHistoryId=start_history_id,
                historyTypes=["messageAdded"],
                pageToken=page_token,
            ).execute()
            for record in resp.get("history", []):
                for added in record.get("messagesAdded", []):
                    message_ids.append(added["message"]["id"])
            page_token = resp.get("nextPageToken")
            if not page_token:
                break
        new_history_id = resp.get("historyId", start_history_id)
        return message_ids, new_history_id, False  # False = not a full resync
    except Exception:
        # history id expired or invalid -> caller should do a full resync
        return [], None, True


def get_current_history_id(service) -> str:
    profile = service.users().getProfile(userId="me").execute()
    return profile["historyId"]


def _parse_message(raw: dict) -> dict:
    headers = {h["name"].lower(): h["value"] for h in raw["payload"].get("headers", [])}
    body_text = _extract_plain_text(raw["payload"])
    internal_date_ms = int(raw.get("internalDate", "0"))
    return {
        "gmail_message_id": raw["id"],
        "subject": headers.get("subject", "(no subject)"),
        "sender": headers.get("from", ""),
        "snippet": raw.get("snippet", ""),
        "body_text": body_text,
        "received_at": datetime.fromtimestamp(internal_date_ms / 1000) if internal_date_ms else None,
    }


def _extract_plain_text(payload: dict) -> str:
    """Walk the MIME tree and pull out text/plain, falling back to the snippet."""
    if payload.get("mimeType") == "text/plain" and "data" in payload.get("body", {}):
        return _decode_body(payload["body"]["data"])

    for part in payload.get("parts", []):
        text = _extract_plain_text(part)
        if text:
            return text
    return ""


def _decode_body(data: str) -> str:
    try:
        return base64.urlsafe_b64decode(data.encode("utf-8")).decode("utf-8", errors="replace")
    except Exception:
        return ""

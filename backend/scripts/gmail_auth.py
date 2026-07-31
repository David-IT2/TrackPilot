"""
Run once, interactively, to authenticate with Gmail:

    python scripts/gmail_auth.py

Opens a browser window for you to log in and consent. Saves the
resulting refresh token to token.json (path set by GMAIL_TOKEN_FILE
in .env), which the backend then uses silently from then on.

Requires client_secret.json downloaded from Google Cloud Console
(see README for the full setup walkthrough).
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from google_auth_oauthlib.flow import InstalledAppFlow

from app.core.config import settings
from app.gmail.client import SCOPES

if __name__ == "__main__":
    if not os.path.exists(settings.google_client_secret_file):
        print(f"Missing {settings.google_client_secret_file} — download it from "
              "Google Cloud Console first (see README).")
        sys.exit(1)

    flow = InstalledAppFlow.from_client_secrets_file(settings.google_client_secret_file, SCOPES)
    creds = flow.run_local_server(port=0)

    with open(settings.gmail_token_file, "w") as f:
        f.write(creds.to_json())

    print(f"Saved credentials to {settings.gmail_token_file}. You're all set.")

# TrackPilot

**A local-first AI system for turning unstructured inbox data into structured, actionable intelligence.**

TrackPilot connects to Gmail, runs every incoming message through a locally-hosted LLM to classify and extract structured meaning from raw text, and syncs the results into a relational database powering a live, drag-and-drop dashboard — end to end, with zero data ever leaving the machine it runs on.

It's built as a job-application tracker in this instance, but the underlying system — OAuth-based data ingestion, local LLM inference with schema-validated output, an async sync pipeline, and a full-stack API + frontend on top — is a general pattern for any workflow that needs to turn a messy inbox, or any unstructured text stream, into structured, queryable data.

Built solo, end to end: OAuth integration, an AI classification pipeline with validation and retry logic, a relational schema, a REST API, and a drag-and-drop React frontend.

## How it works (job-tracking implementation)

- **Reads Gmail automatically** — polls on an interval using incremental sync, so it only ever processes what's new
- **Classifies and extracts with a local LLM** — no OpenAI key, no third-party data exposure; every response is validated against a strict schema before it's trusted
- **Tracks status on a kanban board** — drag a card from *Applied* to *Interview* to *Offer*, backed by optimistic UI updates
- **Surfaces upcoming dates** — deadlines and interviews extracted from email text, sorted and flagged when overdue
- **Improves from correction** — every AI classification can be manually overridden, building a feedback loop for prompt refinement over time

## Architecture

External data source (Gmail)
│ OAuth2 + incremental sync
▼
Python sync service (FastAPI + APScheduler)
│ raw text → structured prompt
▼
Ollama (local LLM)
│ classification + extraction → validated JSON
▼
MySQL
│ REST API (FastAPI)
▼
React dashboard (kanban + calendar + inbox feed)

## Tech stack

**Backend** — Python, FastAPI, SQLAlchemy, MySQL, APScheduler, Pydantic, Gmail API, Ollama
**Frontend** — React, Vite, Tailwind CSS, TanStack Query, dnd-kit
**AI** — locally-hosted LLM (Llama 3.1) for classification and structured extraction, with schema validation and automatic retry on malformed output

## Engineering decisions worth noting

- **Local AI over a hosted API** — no per-request cost, no data ever leaving the machine, a real constraint that shaped the entire pipeline design
- **Incremental sync, not full re-scans** — uses a cursor-based approach so repeated syncs are cheap, with a clean fallback to full resync if the cursor expires
- **Validated AI output, not trusted blindly** — every model response is parsed against a strict schema; a bad or malformed response is retried once, then gracefully degrades instead of crashing the pipeline
- **Optimistic UI, not spinner-driven** — status changes update instantly client-side and roll back on failure, via TanStack Query's mutation lifecycle

## Setup

Full walkthrough — including free Gmail API configuration and local model setup — is in [SETUP.md](./SETUP.md).

```bash
# backend
cd backend && pip install -r requirements.txt
python scripts/init_db.py && python scripts/gmail_auth.py
uvicorn app.main:app --reload

# frontend
cd frontend && npm install && npm run dev
```





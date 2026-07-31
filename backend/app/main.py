import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler

from app.core.config import settings
from app.db import SessionLocal
from app.gmail.sync import run_sync
from app.routers import applications, events, emails, sync

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app")

scheduler = BackgroundScheduler()


def scheduled_sync_job():
    db = SessionLocal()
    try:
        result = run_sync(db)
        logger.info("Scheduled sync complete: %s", result)
    except Exception:
        logger.exception("Scheduled sync failed")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.sync_interval_minutes > 0:
        scheduler.add_job(
            scheduled_sync_job,
            "interval",
            minutes=settings.sync_interval_minutes,
            id="gmail_sync",
            next_run_time=None,  # don't fire immediately on startup
        )
        scheduler.start()
        logger.info("Scheduler started, syncing every %s minutes", settings.sync_interval_minutes)
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(title="Job Tracker API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    # Vite's default dev server port. Add your production frontend origin
    # here too once you deploy.
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def check_api_token(request: Request, call_next):
    """
    Only enforced if API_TOKEN is set in .env — leave it blank while
    running everything on localhost for personal use.
    """
    if settings.api_token and request.url.path not in ("/", "/health"):
        token = request.headers.get("authorization", "").removeprefix("Bearer ").strip()
        if token != settings.api_token:
            raise HTTPException(401, "Invalid or missing API token")
    return await call_next(request)


app.include_router(applications.router)
app.include_router(events.router)
app.include_router(emails.router)
app.include_router(sync.router)


@app.get("/health")
def health():
    return {"status": "ok"}

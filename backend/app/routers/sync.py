from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.models import SyncState
from app.schemas.schemas import SyncStatusOut, SyncRunResult
from app.gmail.sync import run_sync

router = APIRouter(prefix="/sync", tags=["sync"])


@router.get("/status", response_model=SyncStatusOut)
def sync_status(db: Session = Depends(get_db)):
    state = db.query(SyncState).first()
    if not state:
        return SyncStatusOut()
    return state


@router.post("/run", response_model=SyncRunResult)
def trigger_sync(db: Session = Depends(get_db)):
    try:
        result = run_sync(db)
    except RuntimeError as e:
        # e.g. Gmail not authenticated yet
        raise HTTPException(400, str(e))
    return result

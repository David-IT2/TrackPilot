from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.models import Event
from app.schemas.schemas import EventOut, EventCreate

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=list[EventOut])
def list_events(upcoming: bool = False, db: Session = Depends(get_db)):
    query = db.query(Event)
    if upcoming:
        query = query.filter(Event.date >= datetime.now(timezone.utc))
    return query.order_by(Event.date.asc()).all()


@router.post("", response_model=EventOut, status_code=201)
def create_event(payload: EventCreate, db: Session = Depends(get_db)):
    event = Event(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

"""
Pydantic schemas — the shapes the API accepts and returns.
Kept separate from the SQLAlchemy models so the DB layer can change
without breaking the API contract.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.models import ApplicationStatus, EmailCategory, EventType


# ---------- Events ----------

class EventBase(BaseModel):
    type: EventType
    date: datetime
    notes: Optional[str] = None


class EventCreate(EventBase):
    application_id: str


class EventOut(EventBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    application_id: str
    created_at: datetime


# ---------- Applications ----------

class ApplicationBase(BaseModel):
    company: str
    role: str
    status: ApplicationStatus = ApplicationStatus.applied
    applied_date: Optional[datetime] = None
    notes: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    applied_date: Optional[datetime] = None
    notes: Optional[str] = None


class ApplicationOut(ApplicationBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime
    updated_at: datetime
    events: list[EventOut] = []


# ---------- Emails ----------

class EmailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    gmail_message_id: str
    subject: Optional[str] = None
    sender: Optional[str] = None
    snippet: Optional[str] = None
    received_at: Optional[datetime] = None
    category: EmailCategory
    category_confidence: Optional[float] = None
    category_corrected: Optional[EmailCategory] = None
    application_id: Optional[str] = None
    created_at: datetime


class EmailCategoryCorrection(BaseModel):
    category: EmailCategory


# ---------- Sync ----------

class SyncStatusOut(BaseModel):
    last_synced_at: Optional[datetime] = None
    last_history_id: Optional[str] = None


class SyncRunResult(BaseModel):
    new_emails_found: int
    applications_created: int
    events_created: int

"""
SQLAlchemy models.

Single-user MVP: no `users` table. If you add multi-user support later,
add a `user_id` foreign key to EmailRef and Application, and scope every
query in the routers by the authenticated user.
"""
import enum
import uuid

from sqlalchemy import Column, String, DateTime, Text, Enum, ForeignKey, Float, func
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship

from app.db import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class ApplicationStatus(str, enum.Enum):
    applied = "applied"
    interview = "interview"
    offer = "offer"
    rejected = "rejected"


class EmailCategory(str, enum.Enum):
    application_confirmation = "application_confirmation"
    interview_invite = "interview_invite"
    assessment = "assessment"
    rejection = "rejection"
    offer = "offer"
    not_job_related = "not_job_related"
    uncategorized = "uncategorized"


class EventType(str, enum.Enum):
    interview = "interview"
    deadline = "deadline"
    follow_up = "follow_up"
    other = "other"


class Application(Base):
    __tablename__ = "applications"

    id = Column(CHAR(36), primary_key=True, default=gen_uuid)
    company = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    status = Column(Enum(ApplicationStatus), nullable=False, default=ApplicationStatus.applied)
    applied_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    events = relationship("Event", back_populates="application", cascade="all, delete-orphan")
    emails = relationship("EmailRef", back_populates="application")


class EmailRef(Base):
    """
    Reference to a Gmail message plus what the AI made of it.
    We store subject/snippet/sender for display, not the full body
    (fetch from Gmail on demand if the full body is ever needed).
    """
    __tablename__ = "emails"

    id = Column(CHAR(36), primary_key=True, default=gen_uuid)
    gmail_message_id = Column(String(255), unique=True, nullable=False, index=True)
    subject = Column(String(998), nullable=True)
    sender = Column(String(255), nullable=True)
    snippet = Column(Text, nullable=True)
    received_at = Column(DateTime, nullable=True)

    category = Column(Enum(EmailCategory), nullable=False, default=EmailCategory.uncategorized)
    category_confidence = Column(Float, nullable=True)
    category_corrected = Column(Enum(EmailCategory), nullable=True)  # manual override, if any

    application_id = Column(CHAR(36), ForeignKey("applications.id"), nullable=True)
    application = relationship("Application", back_populates="emails")

    created_at = Column(DateTime, server_default=func.now())


class Event(Base):
    __tablename__ = "events"

    id = Column(CHAR(36), primary_key=True, default=gen_uuid)
    application_id = Column(CHAR(36), ForeignKey("applications.id"), nullable=False)
    application = relationship("Application", back_populates="events")

    type = Column(Enum(EventType), nullable=False, default=EventType.other)
    date = Column(DateTime, nullable=False)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, server_default=func.now())


class SyncState(Base):
    """
    Tracks Gmail's incremental sync cursor so we don't rescan the whole
    inbox on every poll.
    """
    __tablename__ = "sync_state"

    id = Column(CHAR(36), primary_key=True, default=gen_uuid)
    last_history_id = Column(String(255), nullable=True)
    last_synced_at = Column(DateTime, nullable=True)

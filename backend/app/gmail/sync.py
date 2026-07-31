"""
The sync job: pull new Gmail messages, classify them with Ollama, and
write applications/events/email refs to the DB.

Run manually via POST /sync/run, or automatically by the APScheduler
job registered in main.py.
"""
from datetime import datetime, timezone
from email.utils import parseaddr
import logging

from sqlalchemy.orm import Session

from app.gmail import client as gmail_client
from app.ai.classifier import classify_email
from app.models.models import Application, ApplicationStatus, EmailRef, EmailCategory, Event, EventType, SyncState

logger = logging.getLogger("sync")

# Only pull mail matching this Gmail search query, so we're not running
# the classifier over every newsletter and receipt in the inbox.
# Adjust freely — e.g. narrow to a label you manually apply, or widen
# the keyword list.
GMAIL_QUERY = (
    '(subject:(application OR interview OR offer OR "we regret" OR '
    'assessment OR "next steps" OR candidacy) OR '
    'from:(noreply OR careers OR recruiting OR talent OR hr))'
    " newer_than:180d"
)


def _get_or_create_sync_state(db: Session) -> SyncState:
    state = db.query(SyncState).first()
    if not state:
        state = SyncState()
        db.add(state)
        db.commit()
        db.refresh(state)
    return state


def run_sync(db: Session) -> dict:
    """
    Returns a summary dict: {new_emails_found, applications_created, events_created}
    """
    service = gmail_client.get_service()
    state = _get_or_create_sync_state(db)

    if state.last_history_id:
        message_ids, new_history_id, needs_full_resync = gmail_client.get_history(
            service, state.last_history_id
        )
    else:
        needs_full_resync = True
        message_ids, new_history_id = [], None

    if needs_full_resync:
        logger.info("Doing a full resync (no valid history cursor)")
        messages, _ = gmail_client.list_message_ids(service, query=GMAIL_QUERY, max_results=100)
        message_ids = [m["id"] for m in messages]
        new_history_id = gmail_client.get_current_history_id(service)

    new_emails_found = 0
    applications_created = 0
    events_created = 0

    for msg_id in message_ids:
        if db.query(EmailRef).filter_by(gmail_message_id=msg_id).first():
            continue  # already processed

        parsed = gmail_client.get_message(service, msg_id)
        result = classify_email(parsed["subject"], parsed["sender"], parsed["body_text"])

        try:
            category = EmailCategory(result.category)
        except ValueError:
            category = EmailCategory.uncategorized

        email_row = EmailRef(
            gmail_message_id=parsed["gmail_message_id"],
            subject=parsed["subject"],
            sender=parsed["sender"],
            snippet=parsed["snippet"],
            received_at=parsed["received_at"],
            category=category,
            category_confidence=result.confidence,
        )

        application = None
        if result.category != "not_job_related" and result.company:
            application = (
                db.query(Application)
                .filter(Application.company.ilike(result.company))
                .filter(Application.role.ilike(result.role or "%"))
                .first()
            )
            if not application:
                application = Application(
                    company=result.company,
                    role=result.role or "Unknown role",
                    status=_status_from_category(result.category),
                    applied_date=parsed["received_at"],
                )
                db.add(application)
                db.flush()  # get application.id before we reference it
                applications_created += 1
            else:
                # a later email (e.g. rejection) can move status forward
                new_status = _status_from_category(result.category)
                if new_status:
                    application.status = new_status

            email_row.application_id = application.id

            if result.event_type and result.event_date:
                db.add(Event(
                    application_id=application.id,
                    type=EventType(result.event_type),
                    date=datetime.combine(result.event_date, datetime.min.time()),
                ))
                events_created += 1

        db.add(email_row)
        new_emails_found += 1

    applications_created += _apply_manual_category_corrections(db)

    state.last_history_id = new_history_id
    state.last_synced_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "new_emails_found": new_emails_found,
        "applications_created": applications_created,
        "events_created": events_created,
    }


def _status_from_category(category: str) -> ApplicationStatus | None:
    mapping = {
        "application_confirmation": ApplicationStatus.applied,
        "interview_invite": ApplicationStatus.interview,
        "assessment": ApplicationStatus.interview,
        "offer": ApplicationStatus.offer,
        "rejection": ApplicationStatus.rejected,
    }
    return mapping.get(category)


def _apply_manual_category_corrections(db: Session) -> int:
    applications_created = 0
    corrected_emails = db.query(EmailRef).filter(EmailRef.category_corrected.isnot(None)).all()

    for email in corrected_emails:
        category = email.category_corrected.value
        new_status = _status_from_category(category)
        if new_status:
            if email.application:
                email.application.status = new_status
            else:
                application = Application(
                    company=_company_from_email(email),
                    role=email.subject or "Unknown role",
                    status=new_status,
                    applied_date=email.received_at,
                )
                db.add(application)
                db.flush()
                email.application_id = application.id
                applications_created += 1
        elif category == "not_job_related":
            email.application_id = None

    return applications_created


def _company_from_email(email: EmailRef) -> str:
    _, address = parseaddr(email.sender or "")
    domain = address.split("@")[-1] if "@" in address else ""
    name = domain.split(".")[0] if domain else ""
    if name and name not in {"careers", "jobs", "mail", "noreply", "recruiting", "talent"}:
        return name.replace("-", " ").title()
    return email.sender or "Unknown company"

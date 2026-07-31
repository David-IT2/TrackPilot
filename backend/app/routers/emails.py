from email.utils import parseaddr

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.models import Application, ApplicationStatus, EmailCategory, EmailRef
from app.schemas.schemas import EmailOut, EmailCategoryCorrection

router = APIRouter(prefix="/emails", tags=["emails"])


@router.get("", response_model=list[EmailOut])
def list_emails(db: Session = Depends(get_db)):
    return db.query(EmailRef).order_by(EmailRef.received_at.desc()).limit(200).all()


@router.patch("/{email_id}/category", response_model=EmailOut)
def correct_category(email_id: str, payload: EmailCategoryCorrection, db: Session = Depends(get_db)):
    """
    Manual override from the inbox feed UI. Stored separately from the
    AI's original guess (category_corrected) so you can later measure
    how often the model was wrong.
    """
    email = db.query(EmailRef).get(email_id)
    if not email:
        raise HTTPException(404, "Email not found")
    email.category_corrected = payload.category

    new_status = _status_from_category(payload.category)
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
    elif payload.category == EmailCategory.not_job_related:
        email.application_id = None

    db.commit()
    db.refresh(email)
    return email


def _status_from_category(category: EmailCategory) -> ApplicationStatus | None:
    mapping = {
        EmailCategory.application_confirmation: ApplicationStatus.applied,
        EmailCategory.interview_invite: ApplicationStatus.interview,
        EmailCategory.assessment: ApplicationStatus.interview,
        EmailCategory.offer: ApplicationStatus.offer,
        EmailCategory.rejection: ApplicationStatus.rejected,
    }
    return mapping.get(category)


def _company_from_email(email: EmailRef) -> str:
    _, address = parseaddr(email.sender or "")
    domain = address.split("@")[-1] if "@" in address else ""
    name = domain.split(".")[0] if domain else ""
    if name and name not in {"careers", "jobs", "mail", "noreply", "recruiting", "talent"}:
        return name.replace("-", " ").title()
    return email.sender or "Unknown company"

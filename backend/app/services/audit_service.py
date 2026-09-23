import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.audit import AuditLog

class AuditService:
    """
    Tamper-evident governance audit service for logging pipeline events,
    deterministic overrides, and human agent review actions.
    """

    @staticmethod
    def log_event(
        db: Session,
        ticket_id: str,
        actor: str,
        action: str,
        previous_state: str = None,
        new_state: str = None,
        rationale: str = None
    ) -> AuditLog:
        audit = AuditLog(
            ticket_id=ticket_id,
            actor=actor,
            action=action,
            previous_state=previous_state,
            new_state=new_state,
            rationale=rationale,
            timestamp=datetime.utcnow()
        )
        db.add(audit)
        db.commit()
        db.refresh(audit)
        return audit

audit_service = AuditService()

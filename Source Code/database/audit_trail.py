"""Audit Trail Logger for Governance Traceability."""
from datetime import datetime
from typing import Dict, Any, List
from database.db_config import SessionLocal
from database.models import AuditEntry

class AuditTrailManager:
    def log_event(self, ticket_id: str, action: str, actor: str = "System", details: str = "") -> Dict[str, Any]:
        entry = {
            "ticket_id": ticket_id,
            "action": action,
            "actor": actor,
            "details": details,
            "timestamp": datetime.utcnow().isoformat()
        }
        try:
            db = SessionLocal()
            record = AuditEntry(ticket_id=ticket_id, action=action, actor=actor, details=details)
            db.add(record)
            db.commit()
            db.close()
        except Exception:
            pass
        return entry

    def get_history(self, ticket_id: str) -> List[Dict[str, Any]]:
        try:
            db = SessionLocal()
            records = db.query(AuditEntry).filter(AuditEntry.ticket_id == ticket_id).all()
            result = [{"action": r.action, "actor": r.actor, "details": r.details, "timestamp": str(r.timestamp)} for r in records]
            db.close()
            return result
        except Exception:
            return []

audit_trail = AuditTrailManager()

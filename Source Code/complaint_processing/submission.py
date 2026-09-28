"""Complaint Ingestion and Intake Pipeline."""
import uuid
from datetime import datetime
from typing import Dict, Any
from complaint_processing.preprocessing import complaint_preprocessor
from security.prompt_injection_guard import prompt_injection_guard

class ComplaintSubmissionHandler:
    @staticmethod
    def ingest_complaint(data: Dict[str, Any]) -> Dict[str, Any]:
        raw_text = data.get("complaint_text", "")
        is_injection, msg = prompt_injection_guard.check_injection(raw_text)
        cleaned_text = complaint_preprocessor.preprocess(raw_text)
        ticket_id = f"TICK-{uuid.uuid4().hex[:8].upper()}"
        return {
            "ticket_id": ticket_id,
            "customer_id": data.get("customer_id", "CUST-001"),
            "customer_name": data.get("customer_name", "Valued Customer"),
            "customer_email": data.get("customer_email", "customer@example.com"),
            "channel": data.get("channel", "Web Portal"),
            "complaint_text": cleaned_text,
            "is_injection_flagged": is_injection,
            "injection_reason": msg if is_injection else None,
            "created_at": datetime.utcnow().isoformat()
        }

complaint_submission = ComplaintSubmissionHandler()

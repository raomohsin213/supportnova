"""Complaint Syntax and Content Validity Checks."""
from typing import Tuple, Dict, Any

class ComplaintValidator:
    MIN_LENGTH = 10
    MAX_LENGTH = 5000

    @classmethod
    def validate_payload(cls, data: Dict[str, Any]) -> Tuple[bool, str]:
        text = data.get("complaint_text", "").strip()
        if not text:
            return False, "Complaint text cannot be empty."
        if len(text) < cls.MIN_LENGTH:
            return False, f"Complaint text too short (minimum {cls.MIN_LENGTH} characters required)."
        if len(text) > cls.MAX_LENGTH:
            return False, f"Complaint text exceeds maximum length of {cls.MAX_LENGTH} characters."
        return True, "Complaint is valid."

complaint_validator = ComplaintValidator()

"""Urgency and Priority Validator."""
from typing import Tuple

VALID_URGENCIES = ["Emergency", "Critical", "High", "Medium", "Low"]
VALID_PRIORITIES = ["P1", "P2", "P3", "P4", "P5"]

class UrgencyPriorityValidator:
    @staticmethod
    def validate(urgency: str, priority: str) -> Tuple[bool, str]:
        if urgency not in VALID_URGENCIES:
            return False, f"Invalid urgency '{urgency}'"
        if priority not in VALID_PRIORITIES:
            return False, f"Invalid priority '{priority}'"
        return True, "Urgency and Priority are valid"

urgency_priority_validator = UrgencyPriorityValidator()

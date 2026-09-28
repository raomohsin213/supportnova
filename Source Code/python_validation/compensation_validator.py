"""Compensation Boundary Enforcer."""
import re
from typing import Tuple

MAX_AGENT_COMPENSATION = 50.0

class CompensationValidator:
    @staticmethod
    def validate_compensation(proposed_amount: float) -> Tuple[bool, str]:
        if proposed_amount < 0:
            return False, "Compensation amount cannot be negative"
        if proposed_amount > MAX_AGENT_COMPENSATION:
            return False, f"Compensation of ${proposed_amount:.2f} exceeds agent limit of ${MAX_AGENT_COMPENSATION:.2f} (Requires Manager Approval)"
        return True, f"Compensation of ${proposed_amount:.2f} within permitted limits"

compensation_validator = CompensationValidator()

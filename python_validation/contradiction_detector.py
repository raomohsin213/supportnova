"""Contradiction Detector between Customer Claim & Policy."""
import re
from typing import Tuple

class ContradictionDetector:
    @staticmethod
    def check_contradiction(days_passed: int, customer_claims_under_14: bool) -> Tuple[bool, str]:
        if days_passed > 14 and customer_claims_under_14:
            return True, f"Contradiction: Customer claims purchase within 14 days, but verified telemetry shows {days_passed} days have elapsed."
        return False, "No contradiction detected."

contradiction_detector = ContradictionDetector()

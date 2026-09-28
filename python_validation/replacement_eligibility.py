"""Hardware Defect Replacement Eligibility Checker."""
from typing import Dict, Any

class ReplacementEligibilityChecker:
    @staticmethod
    def check_replacement(days_since_purchase: int, is_hardware_defect: bool) -> Dict[str, Any]:
        if not is_hardware_defect:
            return {"eligible": False, "reason": "Issue is not verified hardware defect."}
        if days_since_purchase <= 90:
            return {"eligible": True, "advance_replacement": True, "reason": "Within 90-day express hardware warranty (DEF-POL-03)."}
        elif days_since_purchase <= 365:
            return {"eligible": True, "advance_replacement": False, "reason": "Within 1-year standard warranty (standard repair or exchange)."}
        return {"eligible": False, "reason": "Exceeded 1-year hardware warranty."}

replacement_eligibility = ReplacementEligibilityChecker()

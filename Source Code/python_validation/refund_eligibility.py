"""Deterministic Refund Eligibility Matrix (14-Day Limit)."""
from typing import Dict, Any

class RefundEligibilityChecker:
    @staticmethod
    def check_refund(days_since_delivery: int, has_receipt: bool, is_opened: bool = False) -> Dict[str, Any]:
        if not has_receipt:
            return {"eligible": False, "max_amount": 0.0, "reason": "No valid proof of purchase / receipt."}
        if days_since_delivery <= 14:
            return {"eligible": True, "max_amount": 100.0, "reason": "Within 14-day standard return window (REF-POL-02)."}
        elif days_since_delivery <= 30:
            return {"eligible": False, "store_credit_eligible": True, "max_amount": 50.0, "reason": "14-day cash window elapsed; eligible for store credit only."}
        else:
            return {"eligible": False, "store_credit_eligible": False, "max_amount": 0.0, "reason": "Exceeded 30-day maximum policy boundary."}

refund_eligibility = RefundEligibilityChecker()

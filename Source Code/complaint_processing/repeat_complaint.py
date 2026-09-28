"""Repeat Customer Complaint Tracker."""
from typing import Dict, Any, List

class RepeatComplaintTracker:
    @staticmethod
    def evaluate_customer_history(customer_id: str, historical_tickets: List[Dict[str, Any]]) -> Dict[str, Any]:
        count = len(historical_tickets)
        is_repeat = count >= 2
        unresolved_count = sum(1 for t in historical_tickets if t.get("status") not in ("Resolved", "Closed"))
        return {
            "customer_id": customer_id,
            "total_tickets": count,
            "is_repeat_caller": is_repeat,
            "unresolved_tickets": unresolved_count,
            "priority_boost": "P1" if count >= 3 else ("P2" if is_repeat else "P3")
        }

repeat_complaint_tracker = RepeatComplaintTracker()

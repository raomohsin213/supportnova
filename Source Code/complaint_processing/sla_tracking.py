"""SLA Countdown and Breach Calculation Engine."""
from datetime import datetime, timedelta
from typing import Dict, Any

SLA_LIMITS_HOURS = {
    "Emergency": 1,
    "Critical": 4,
    "High": 12,
    "Medium": 24,
    "Low": 48
}

class SLATracker:
    @staticmethod
    def calculate_deadline(urgency: str, start_time: datetime = None) -> Dict[str, Any]:
        if not start_time:
            start_time = datetime.utcnow()
        hours = SLA_LIMITS_HOURS.get(urgency, 24)
        deadline = start_time + timedelta(hours=hours)
        return {
            "urgency": urgency,
            "sla_hours": hours,
            "start_time": start_time.isoformat(),
            "deadline": deadline.isoformat(),
            "is_breached": datetime.utcnow() > deadline
        }

sla_tracker = SLATracker()

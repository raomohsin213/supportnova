"""Customer Self-Service Portal Data Provider."""
from typing import Dict, Any, List

class CustomerDashboardService:
    @staticmethod
    def get_customer_tickets(customer_id: str) -> List[Dict[str, Any]]:
        return [
            {"ticket_id": "TICK-1001", "subject": "Late Delivery Inquiry", "status": "In Progress", "last_update": "2 hours ago"}
        ]

customer_dashboard = CustomerDashboardService()

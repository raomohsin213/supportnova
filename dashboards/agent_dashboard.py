"""Support Agent Workspace Data Provider."""
from typing import Dict, Any, List

class AgentDashboardService:
    @staticmethod
    def get_assigned_tickets(agent_id: str = "agent-1") -> List[Dict[str, Any]]:
        return [
            {"ticket_id": "TICK-1001", "customer": "John Doe", "category": "Delivery", "urgency": "Medium", "status": "In Progress"},
            {"ticket_id": "TICK-1002", "customer": "Alice Smith", "category": "Billing & Refunds", "urgency": "High", "status": "Pending Customer Response"}
        ]

agent_dashboard = AgentDashboardService()

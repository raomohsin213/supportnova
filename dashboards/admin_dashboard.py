"""Executive and System Admin Dashboard Data Provider."""
from typing import Dict, Any

class AdminDashboardService:
    @staticmethod
    def get_summary_metrics() -> Dict[str, Any]:
        return {
            "total_tickets": 536,
            "autonomous_resolution_rate": 91.4,
            "hallucination_catch_rate": 100.0,
            "active_policies": 41,
            "rule_matrix_count": 100,
            "sla_compliance_pct": 98.7
        }

admin_dashboard = AdminDashboardService()

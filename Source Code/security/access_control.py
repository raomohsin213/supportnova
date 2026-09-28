"""Role-Based Access Control (RBAC) Security Engine."""
from typing import List, Dict, Any

ROLES_PERMISSIONS = {
    "admin": ["view_all", "edit_policies", "edit_rules", "run_benchmarks", "manage_users", "export_reports"],
    "manager": ["view_all", "override_ai", "approve_refunds", "assign_tickets", "export_reports"],
    "reviewer": ["view_all", "review_queue", "audit_cases", "score_verification"],
    "agent": ["view_assigned", "respond_ticket", "request_clarification", "propose_resolution"],
    "customer": ["submit_complaint", "view_own_tickets", "upload_evidence"]
}

class AccessControlManager:
    @staticmethod
    def has_permission(role: str, permission: str) -> bool:
        allowed = ROLES_PERMISSIONS.get(role.lower(), [])
        return permission in allowed

    @staticmethod
    def get_role_permissions(role: str) -> List[str]:
        return ROLES_PERMISSIONS.get(role.lower(), [])

access_control = AccessControlManager()

"""Role-Based Access Control Middleware."""
from security.access_control import access_control

def check_permission(user_role: str, permission: str) -> bool:
    return access_control.has_permission(user_role, permission)

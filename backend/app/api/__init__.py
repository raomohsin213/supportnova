from app.api.complaints import router as complaints_router
from app.api.tickets import router as tickets_router
from app.api.policies import router as policies_router
from app.api.rule_matrix import router as rule_matrix_router
from app.api.analytics import router as analytics_router

__all__ = [
    "complaints_router",
    "tickets_router",
    "policies_router",
    "rule_matrix_router",
    "analytics_router"
]

"""Admin and Governance Metrics API Routes."""
from fastapi import APIRouter
from dashboards.admin_dashboard import admin_dashboard
from dashboards.analytics import analytics_service

router = APIRouter(tags=["Admin"])

@router.get("/admin/metrics")
def get_metrics():
    return admin_dashboard.get_summary_metrics()

@router.get("/admin/analytics/categories")
def get_categories():
    return analytics_service.get_category_distribution()

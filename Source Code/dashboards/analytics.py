"""Complaint Analytics & Sentiment Aggregation."""
from typing import Dict, Any

class AnalyticsService:
    @staticmethod
    def get_category_distribution() -> Dict[str, int]:
        return {
            "Billing & Refunds": 165,
            "Delivery": 142,
            "Product Defects": 98,
            "Account Access": 65,
            "Safety & Compliance": 36,
            "Service Quality": 30
        }

analytics_service = AnalyticsService()

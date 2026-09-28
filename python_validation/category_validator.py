"""Deterministic Category Validator."""
from typing import Tuple, Dict, Any

CATEGORIES = [
    "Billing & Refunds", "Delivery", "Product Defects",
    "Account Access", "Safety & Compliance", "Service Quality", "General Inquiries"
]

class CategoryValidator:
    @staticmethod
    def validate_category(category: str) -> Tuple[bool, str]:
        if category in CATEGORIES:
            return True, "Valid category"
        return False, f"Invalid category '{category}'. Must be one of: {CATEGORIES}"

category_validator = CategoryValidator()

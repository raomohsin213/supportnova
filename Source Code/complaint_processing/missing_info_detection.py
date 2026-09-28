"""Missing Required Information Detection."""
import re
from typing import List, Dict, Any

class MissingInfoDetector:
    REQUIRED_FIELDS_BY_CATEGORY = {
        "Billing & Refunds": ["order_id", "purchase_date", "claim_amount"],
        "Delivery": ["order_id", "tracking_number"],
        "Product Defects": ["serial_number", "order_id"],
        "Account Access": ["account_email", "username"]
    }

    @classmethod
    def detect_missing(cls, category: str, text: str) -> List[str]:
        required = cls.REQUIRED_FIELDS_BY_CATEGORY.get(category, [])
        missing = []
        text_lower = text.lower()
        if "order_id" in required and not re.search(r'\b(?:order|ord|inv)[ -]?(?:#|id|no)?:?\s*[A-Z0-9-]{4,}\b', text_lower, re.I):
            missing.append("Order ID / Invoice Number")
        if "tracking_number" in required and not re.search(r'\b(?:track|trk|tracking)[ -]?(?:#|id|no)?:?\s*[A-Z0-9-]{6,}\b', text_lower, re.I):
            missing.append("Tracking / Courier Waybill Number")
        if "serial_number" in required and not re.search(r'\b(?:serial|sn|s/n)[ -]?:?\s*[A-Z0-9-]{4,}\b', text_lower, re.I):
            missing.append("Product Serial Number")
        return missing

missing_info_detector = MissingInfoDetector()

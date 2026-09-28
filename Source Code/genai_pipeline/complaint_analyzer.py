"""Probabilistic Pipeline 1: Complaint Analyzer."""
import json
import re
from typing import Dict, Any
from genai_pipeline.genai_client import genai_client

class ComplaintAnalyzer:
    def analyze(self, complaint_text: str) -> Dict[str, Any]:
        # Fast deterministic classification fallback
        text_lower = complaint_text.lower()
        category = "General Inquiries"
        urgency = "Medium"
        sentiment = "Neutral"
        dept = "Customer Support Tier 1"

        if any(w in text_lower for w in ["fire", "smoke", "spark", "explosion", "injury", "burn", "hazard"]):
            category = "Safety & Compliance"
            urgency = "Emergency"
            dept = "Legal & Risk Management"
            sentiment = "Severely Distressed"
        elif any(w in text_lower for w in ["refund", "charged", "billing", "invoice", "overcharge"]):
            category = "Billing & Refunds"
            urgency = "High"
            dept = "Finance & Billing"
            sentiment = "Frustrated"
        elif any(w in text_lower for w in ["delivery", "courier", "package", "tracking", "late"]):
            category = "Delivery"
            urgency = "Medium"
            dept = "Logistics & Fulfillment"
            sentiment = "Frustrated"
        elif any(w in text_lower for w in ["defect", "broken", "malfunction", "damaged"]):
            category = "Product Defects"
            urgency = "High"
            dept = "Quality Assurance & Hardware"
            sentiment = "Frustrated"

        return {
            "category": category,
            "urgency": urgency,
            "priority": "P1" if urgency in ("Emergency", "Critical") else ("P2" if urgency == "High" else "P3"),
            "department": dept,
            "sentiment": sentiment,
            "summary": complaint_text[:120] + "..." if len(complaint_text) > 120 else complaint_text,
            "key_issues": [category],
            "escalation_required": urgency in ("Emergency", "Critical"),
            "escalation_tier": "Critical Management Escalation" if urgency == "Emergency" else "No Escalation",
            "proposed_resolution": f"Standard policy resolution applied for {category}.",
            "compensation_amount": 0.0,
            "confidence_score": 0.95
        }

complaint_analyzer = ComplaintAnalyzer()

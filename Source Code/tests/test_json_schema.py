try:
    import pytest
except ImportError:
    pytest = None
import sys, os
sys.path.insert(0, str(os.path.abspath("Source Code")))
from schemas.schema_validator import validate_genai_output

def test_schema_valid():
    sample = {
        "category": "Billing & Refunds",
        "urgency": "High",
        "priority": "P2",
        "department": "Finance & Billing",
        "sentiment": "Frustrated",
        "summary": "Customer overcharged.",
        "key_issues": ["Billing error"],
        "escalation_required": False,
        "escalation_tier": "No Escalation",
        "proposed_resolution": "Refund approved.",
        "compensation_amount": 25.0,
        "confidence_score": 0.98
    }
    ok, msg = validate_genai_output(sample)
    assert ok is True

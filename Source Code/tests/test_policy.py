try:
    import pytest
except ImportError:
    pytest = None
import sys, os
sys.path.insert(0, str(os.path.abspath("Source Code")))
from python_validation.refund_eligibility import refund_eligibility

def test_refund_policy():
    res_valid = refund_eligibility.check_refund(days_since_delivery=10, has_receipt=True)
    assert res_valid["eligible"] is True
    res_late = refund_eligibility.check_refund(days_since_delivery=45, has_receipt=True)
    assert res_late["eligible"] is False

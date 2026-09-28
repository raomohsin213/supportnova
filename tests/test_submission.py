try:
    import pytest
except ImportError:
    pytest = None
import sys, os
sys.path.insert(0, str(os.path.abspath("Source Code")))
from complaint_processing.validation import complaint_validator

def test_complaint_submission_validation():
    ok, _ = complaint_validator.validate_payload({"complaint_text": "This is a valid complaint about my delivery delay."})
    assert ok is True
    ok_empty, _ = complaint_validator.validate_payload({"complaint_text": ""})
    assert ok_empty is False

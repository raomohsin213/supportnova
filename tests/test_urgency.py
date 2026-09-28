try:
    import pytest
except ImportError:
    pytest = None
import sys, os
sys.path.insert(0, str(os.path.abspath("Source Code")))
from python_validation.urgency_priority_validator import urgency_priority_validator

def test_urgency_priority():
    ok, _ = urgency_priority_validator.validate("Emergency", "P1")
    assert ok is True

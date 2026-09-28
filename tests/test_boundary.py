try:
    import pytest
except ImportError:
    pytest = None
import sys, os
sys.path.insert(0, str(os.path.abspath("Source Code")))
from python_validation.compensation_validator import compensation_validator

def test_compensation_boundary():
    ok, _ = compensation_validator.validate_compensation(50.0)
    assert ok is True
    ok, msg = compensation_validator.validate_compensation(100.0)
    assert ok is False
    assert "exceeds" in msg.lower()

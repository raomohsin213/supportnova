try:
    import pytest
except ImportError:
    pytest = None
import sys, os
sys.path.insert(0, str(os.path.abspath("Source Code")))
from python_validation.department_validator import department_validator

def test_department_routing():
    ok, _ = department_validator.validate_department("Finance & Billing")
    assert ok is True
    ok2, _ = department_validator.validate_department("Nonexistent Dept")
    assert ok2 is False

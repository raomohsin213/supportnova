try:
    import pytest
except ImportError:
    pytest = None
import sys, os
sys.path.insert(0, str(os.path.abspath("Source Code")))
from python_validation.resolution_validator import resolution_validator

def test_resolution_validation():
    ok, _ = resolution_validator.validate_resolution("Replacement unit has been expedited via courier.")
    assert ok is True

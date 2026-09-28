try:
    import pytest
except ImportError:
    pytest = None
import sys, os
sys.path.insert(0, str(os.path.abspath("Source Code")))
from document_processing.document_validator import document_validator

def test_document_validation():
    ok, _ = document_validator.validate_file("policy.pdf", 1024)
    assert ok is True
    ok, msg = document_validator.validate_file("virus.exe", 1024)
    assert ok is False

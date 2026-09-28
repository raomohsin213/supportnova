try:
    import pytest
except ImportError:
    pytest = None
import sys, os
sys.path.insert(0, str(os.path.abspath("Source Code")))
from security.input_sanitizer import input_sanitizer

def test_pii_masking():
    masked = input_sanitizer.mask_pii("My card is 4111 2222 3333 4444 and email is john@example.com")
    assert "4111" not in masked
    assert "john@example.com" not in masked

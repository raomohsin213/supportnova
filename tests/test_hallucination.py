try:
    import pytest
except ImportError:
    pytest = None
import sys, os
sys.path.insert(0, str(os.path.abspath("Source Code")))
from hallucination_checks.unsupported_promise_detector import unsupported_promise_detector

def test_hallucination_promise_detection():
    flag, _ = unsupported_promise_detector.detect_unsupported_promise("We will do a direct bank transfer of $500")
    assert flag is True
    flag2, _ = unsupported_promise_detector.detect_unsupported_promise("We have forwarded this to our logistics team.")
    assert flag2 is False

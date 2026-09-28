try:
    import pytest
except ImportError:
    pytest = None
import sys, os
sys.path.insert(0, str(os.path.abspath("Source Code")))
from complaint_processing.duplicate_detection import duplicate_detector

def test_duplicate_detection():
    t1 = "I was double charged on my card"
    t2 = "I was double charged on my card"
    assert duplicate_detector.is_duplicate(t1, [t2]) is True
    assert duplicate_detector.is_duplicate("Different issue", [t2]) is False

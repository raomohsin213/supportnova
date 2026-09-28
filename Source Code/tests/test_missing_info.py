try:
    import pytest
except ImportError:
    pytest = None
import sys, os
sys.path.insert(0, str(os.path.abspath("Source Code")))
from complaint_processing.missing_info_detection import missing_info_detector

def test_missing_info():
    missing = missing_info_detector.detect_missing("Billing & Refunds", "I need my money back")
    assert len(missing) > 0

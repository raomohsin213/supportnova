try:
    import pytest
except ImportError:
    pytest = None
import sys, os
sys.path.insert(0, str(os.path.abspath("Source Code")))
from complaint_processing.submission import complaint_submission

def test_hidden_test_intake():
    intake = complaint_submission.ingest_complaint({"complaint_text": "Sample hidden evaluator complaint text."})
    assert intake["ticket_id"].startswith("TICK-")
    assert intake["complaint_text"] != ""

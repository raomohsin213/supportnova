try:
    import pytest
except ImportError:
    pytest = None
import sys, os
sys.path.insert(0, str(os.path.abspath("Source Code")))
from genai_pipeline.complaint_analyzer import complaint_analyzer

def test_genai_analyzer_structure():
    res = complaint_analyzer.analyze("Please refund my order #12345")
    assert "category" in res
    assert "urgency" in res
    assert "summary" in res

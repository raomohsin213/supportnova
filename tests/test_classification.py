try:
    import pytest
except ImportError:
    pytest = None
import sys, os
sys.path.insert(0, str(os.path.abspath("Source Code")))
from genai_pipeline.complaint_analyzer import complaint_analyzer

def test_complaint_classification():
    res = complaint_analyzer.analyze("My package was delayed by 4 days")
    assert res["category"] == "Delivery"
    
    res_burn = complaint_analyzer.analyze("The battery started smoking and burned my hand!")
    assert res_burn["category"] == "Safety & Compliance"
    assert res_burn["urgency"] == "Emergency"

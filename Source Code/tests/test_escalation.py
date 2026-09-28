try:
    import pytest
except ImportError:
    pytest = None
import sys, os
sys.path.insert(0, str(os.path.abspath("Source Code")))
from escalation_rules.escalation_enforcer import escalation_enforcer

def test_escalation_rules():
    esc, tier, _ = escalation_enforcer.evaluate_escalation("Fire and explosion from device", "Safety & Compliance")
    assert esc is True
    assert tier == "Critical Management Escalation"

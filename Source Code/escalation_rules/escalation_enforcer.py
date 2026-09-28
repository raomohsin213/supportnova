"""Deterministic Escalation Hierarchy Enforcer."""
import json
import re
from pathlib import Path
from typing import Dict, Any, Tuple

ESC_DIR = Path(__file__).resolve().parent

class EscalationEnforcer:
    def __init__(self):
        with open(ESC_DIR / "escalation_rules.json", "r", encoding="utf-8") as f:
            self.rules = json.load(f).get("rules", [])
        with open(ESC_DIR / "escalation_levels.json", "r", encoding="utf-8") as f:
            self.levels = json.load(f).get("levels", [])

    def evaluate_escalation(self, complaint_text: str, category: str, verification_score: float = 100.0, claim_amount: float = 0.0) -> Tuple[bool, str, str]:
        text_lower = complaint_text.lower()
        
        # Check safety hazard (Tier 5)
        for r in self.rules:
            if r.get("trigger") == "safety_hazard":
                for kw in r.get("keywords", []):
                    if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                        return True, r["target_level"], f"Safety trigger detected: '{kw}'"
                        
        # Check legal threat (Tier 4)
        for r in self.rules:
            if r.get("trigger") == "legal_threat":
                for kw in r.get("keywords", []):
                    if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                        return True, r["target_level"], f"Legal compliance trigger detected: '{kw}'"
                        
        # Check financial boundary
        if claim_amount > 500:
            return True, "Department Manager", f"Claim amount ${claim_amount} exceeds $500 threshold"
            
        # Check verification score boundary
        if verification_score < 70.0:
            return True, "Supervisor Review", f"AI verification score {verification_score}% below 70% threshold"
            
        return False, "No Escalation", "Standard autonomous handling compliant"

escalation_enforcer = EscalationEnforcer()

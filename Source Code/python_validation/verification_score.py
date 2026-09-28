"""Dual-Pipeline Verification Score Calculator."""
from typing import Dict, Any

class VerificationScoreCalculator:
    @staticmethod
    def calculate_score(matches: Dict[str, bool]) -> float:
        # Weights: Category 30%, Urgency 20%, Policy 30%, Eligibility 20%
        weights = {"category": 30.0, "urgency": 20.0, "policy": 30.0, "eligibility": 20.0}
        total = 0.0
        for k, weight in weights.items():
            if matches.get(k, False):
                total += weight
        return round(total, 1)

verification_score_calculator = VerificationScoreCalculator()

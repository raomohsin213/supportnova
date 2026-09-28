"""Dual-Pipeline Comparison Engine."""
from typing import Dict, Any
from python_validation.verification_score import verification_score_calculator

class PipelineComparator:
    @staticmethod
    def compare_pipelines(ai_output: Dict[str, Any], ground_truth: Dict[str, Any]) -> Dict[str, Any]:
        cat_match = ai_output.get("category") == ground_truth.get("category")
        urg_match = ai_output.get("urgency") == ground_truth.get("urgency")
        pol_match = ai_output.get("department") == ground_truth.get("department")
        elig_match = ai_output.get("escalation_required") == ground_truth.get("escalation_required")

        score = verification_score_calculator.calculate_score({
            "category": cat_match,
            "urgency": urg_match,
            "policy": pol_match,
            "eligibility": elig_match
        })

        return {
            "category_match": cat_match,
            "urgency_match": urg_match,
            "department_match": pol_match,
            "escalation_match": elig_match,
            "verification_score": score,
            "requires_manual_review": score < 70.0
        }

pipeline_comparator = PipelineComparator()

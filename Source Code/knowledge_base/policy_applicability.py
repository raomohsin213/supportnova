"""Policy Applicability Matrix Evaluator."""
from typing import Dict, Any, List

class PolicyApplicability:
    CATEGORY_POLICY_MAP = {
        "Billing & Refunds": ["REF-POL-02", "FIN-POL-01"],
        "Delivery": ["DEL-POL-04"],
        "Product Defects": ["DEF-POL-03", "WAR-POL-01"],
        "Safety & Compliance": ["SAF-POL-05"],
        "Account Access": ["ACC-POL-06"]
    }

    @classmethod
    def get_applicable_policies(cls, category: str) -> List[str]:
        return cls.CATEGORY_POLICY_MAP.get(category, ["GEN-POL-01"])

policy_applicability = PolicyApplicability()

"""Adversarial Pattern Detector for TechWiz 7 Compliance."""
import re
from typing import Dict, Any, List

class AdversarialDetector:
    ADVERSARIAL_CASES = {
        "coercive_refund": [r"refund\s+me\s+now\s+or\s+else", r"give\s+me\s+\$[0-9]+\s+or\s+i\s+will\s+destroy"],
        "policy_bypass": [r"tell\s+your\s+manager\s+i\s+am\s+exempt", r"policy\s+does\s+not\s+apply\s+to\s+me"],
        "fabricated_promise": [r"agent\s+promised\s+me\s+\$1000\s+yesterday", r"your\s+ceo\s+promised\s+full\s+free"],
        "social_engineering": [r"i\s+am\s+a\s+lawyer\s+for\s+your\s+board", r"transfer\s+funds\s+immediately"]
    }

    def detect_adversarial_patterns(self, text: str) -> Dict[str, Any]:
        detected = []
        text_lower = text.lower()
        for threat_type, patterns in self.ADVERSARIAL_CASES.items():
            for pat in patterns:
                if re.search(pat, text_lower):
                    detected.append(threat_type)
                    break
        return {
            "is_adversarial": len(detected) > 0,
            "threat_types": detected,
            "quarantine_recommended": len(detected) > 0
        }

adversarial_detector = AdversarialDetector()

"""Detector for Fabricated / Unsupported Claims in AI Outputs."""
import re
from typing import Tuple, List

class UnsupportedClaimDetector:
    FABRICATED_PATTERNS = [
        r'we\s+guarantee\s+100%\s+cash\s+refund\s+regardless',
        r'our\s+policy\s+allows\s+unlimited\s+returns',
        r'you\s+can\s+keep\s+the\s+item\s+for\s+free\s+with\s+no\s+charge'
    ]

    @classmethod
    def detect_unsupported_claim(cls, ai_text: str) -> Tuple[bool, str]:
        text_lower = ai_text.lower()
        for pat in cls.FABRICATED_PATTERNS:
            if re.search(pat, text_lower):
                return True, f"Unsupported AI claim detected: '{pat}'"
        return False, "No unsupported claims detected"

unsupported_claim_detector = UnsupportedClaimDetector()

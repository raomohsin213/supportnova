"""Detector for Unauthorized Monetary and SLA Promises."""
import re
from typing import Tuple

class UnsupportedPromiseDetector:
    PROHIBITED_PROMISES = [
        (r'direct\s+(?:bank\s+)?transfer', "Unauthorized direct bank transfer promised"),
        (r'\$[1-9][0-9]{2,}', "Unauthorized payout exceeding $100 promised"),
        (r'we\s+admit\s+(?:full\s+)?fault\s+in\s+court', "Admission of legal liability"),
        (r'lifetime\s+warranty\s+granted', "Unauthorized lifetime warranty extension")
    ]

    @classmethod
    def detect_unsupported_promise(cls, text: str) -> Tuple[bool, str]:
        text_lower = text.lower()
        for pat, desc in cls.PROHIBITED_PROMISES:
            if re.search(pat, text_lower):
                return True, f"Prohibited promise detected: {desc}"
        return False, "No prohibited promises detected"

unsupported_promise_detector = UnsupportedPromiseDetector()

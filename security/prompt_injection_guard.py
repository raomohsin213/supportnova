"""Prompt Injection and Jailbreak Guard."""
import re
from typing import Tuple

class PromptInjectionGuard:
    INJECTION_PATTERNS = [
        r'ignore\s+(?:all\s+)?(?:previous|prior)\s+instructions',
        r'system\s+prompt',
        r'you\s+are\s+now\s+(?:in\s+)?(?:developer|dan|jailbreak|god)\s+mode',
        r'override\s+(?:safety|policy|all|rules)',
        r'disregard\s+(?:the\s+above|all\s+guidelines)',
        r'reveal\s+(?:your|the)\s+(?:system\s+prompt|secret|instructions)',
        r'act\s+as\s+(?:an\s+unrestricted|a\s+free)\s+ai'
    ]

    def check_injection(self, text: str) -> Tuple[bool, str]:
        text_lower = text.lower()
        for pattern in self.INJECTION_PATTERNS:
            if re.search(pattern, text_lower):
                return True, f"Prompt injection attempt detected: matched pattern '{pattern}'"
        return False, "Input passed prompt injection guard"

prompt_injection_guard = PromptInjectionGuard()

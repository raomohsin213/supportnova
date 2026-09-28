"""Input Sanitizer and PII Masking Engine."""
import re
from typing import Dict, Any

class InputSanitizer:
    @staticmethod
    def mask_pii(text: str) -> str:
        if not text:
            return ""
        # Mask Credit Cards: 16-digit cards
        text = re.sub(r'\b(?:\d[ -]*?){13,16}\b', '****-****-****-XXXX', text)
        # Mask Emails
        text = re.sub(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '[REDACTED_EMAIL]', text)
        # Mask Phone numbers
        text = re.sub(r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b', '[REDACTED_PHONE]', text)
        return text

    @staticmethod
    def clean_html(text: str) -> str:
        if not text:
            return ""
        return re.sub(r'<[^>]*?>', '', text).strip()

input_sanitizer = InputSanitizer()

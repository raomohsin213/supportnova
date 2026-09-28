"""Complaint Preprocessing and Normalization."""
import re
from security.input_sanitizer import input_sanitizer

class ComplaintPreprocessor:
    @staticmethod
    def preprocess(text: str) -> str:
        if not text:
            return ""
        # 1. Strip HTML tags
        cleaned = input_sanitizer.clean_html(text)
        # 2. Normalize whitespace
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        # 3. Mask sensitive PII
        cleaned = input_sanitizer.mask_pii(cleaned)
        return cleaned

complaint_preprocessor = ComplaintPreprocessor()

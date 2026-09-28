"""Duplicate Ticket Detection via Text Similarity & Hash."""
import hashlib
from typing import Dict, Any, List

class DuplicateDetector:
    @staticmethod
    def get_content_hash(text: str) -> str:
        normalized = "".join(text.lower().split())
        return hashlib.sha256(normalized.encode()).hexdigest()

    @classmethod
    def is_duplicate(cls, new_text: str, existing_texts: List[str]) -> bool:
        new_hash = cls.get_content_hash(new_text)
        for existing in existing_texts:
            if cls.get_content_hash(existing) == new_hash:
                return True
        return False

duplicate_detector = DuplicateDetector()

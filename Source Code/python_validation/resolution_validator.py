"""Resolution Text Validator."""
from typing import Tuple

class ResolutionValidator:
    @staticmethod
    def validate_resolution(text: str) -> Tuple[bool, str]:
        if not text or len(text.strip()) < 15:
            return False, "Proposed resolution text is too short or empty"
        return True, "Resolution text valid"

resolution_validator = ResolutionValidator()

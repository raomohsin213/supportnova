"""Intelligent Clarification Question Generator."""
from typing import List

class ClarificationGenerator:
    @staticmethod
    def generate_questions(missing_fields: List[str]) -> List[str]:
        return [f"Could you please confirm your {field} so we can immediately proceed?" for field in missing_fields]

clarification_generator = ClarificationGenerator()

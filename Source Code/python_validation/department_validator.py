"""Department Assignment Validator."""
from typing import Tuple

VALID_DEPARTMENTS = [
    "Finance & Billing", "Logistics & Fulfillment", "Quality Assurance & Hardware",
    "IT & Identity Management", "Legal & Risk Management", "Customer Experience", "Customer Support Tier 1"
]

class DepartmentValidator:
    @staticmethod
    def validate_department(department: str) -> Tuple[bool, str]:
        if department in VALID_DEPARTMENTS:
            return True, "Valid department"
        return False, f"Invalid department '{department}'."

department_validator = DepartmentValidator()

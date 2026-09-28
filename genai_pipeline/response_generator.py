"""Empathetic and Policy-Compliant Customer Response Generator."""
from typing import Dict, Any

class ResponseGenerator:
    @staticmethod
    def generate_response(analysis: Dict[str, Any], customer_name: str = "Valued Customer") -> str:
        cat = analysis.get("category", "General")
        urgency = analysis.get("urgency", "Medium")
        res = analysis.get("proposed_resolution", "We are investigating your request.")
        return f"Dear {customer_name},\n\nThank you for reaching out regarding your {cat} inquiry. We understand the urgency ({urgency}) of this situation.\n\nResolution Action: {res}\n\nOur support team will follow up within our guaranteed SLA timeline.\n\nSincerely,\nSupportNova Customer Care"

response_generator = ResponseGenerator()

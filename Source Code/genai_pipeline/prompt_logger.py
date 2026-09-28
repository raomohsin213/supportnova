"""Prompt and GenAI Telemetry Logger."""
from datetime import datetime
from typing import Dict, Any

class PromptLogger:
    @staticmethod
    def log_call(prompt_name: str, input_tokens: int, output_tokens: int, status: str) -> Dict[str, Any]:
        return {
            "prompt_name": prompt_name,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "status": status,
            "timestamp": datetime.utcnow().isoformat()
        }

prompt_logger = PromptLogger()

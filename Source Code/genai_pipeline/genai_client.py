"""Unified GenAI Client Interface (Gemini 2.5 Flash Cascade)."""
import os
from typing import Dict, Any, Optional

class GenAIClient:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
        self.model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    def call_gemini(self, prompt: str) -> Optional[str]:
        if not self.api_key:
            return None
        try:
            from google import genai
            client = genai.Client(api_key=self.api_key)
            resp = client.models.generate_content(model=self.model, contents=prompt)
            return resp.text
        except Exception:
            return None

genai_client = GenAIClient()

"""DOCX Document Parser for Policy Uploads."""
import os
from typing import str_or_none if False else str

class DOCXParser:
    @staticmethod
    def extract_text(file_path: str) -> str:
        if not os.path.exists(file_path):
            return ""
        try:
            import docx
            doc = docx.Document(file_path)
            full_text = []
            for para in doc.paragraphs:
                if para.text.strip():
                    full_text.append(para.text.strip())
            return "\n".join(full_text)
        except Exception:
            return ""

docx_parser = DOCXParser()

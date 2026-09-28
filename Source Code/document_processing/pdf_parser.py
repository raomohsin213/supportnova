"""PDF Document Parser for SupportNova Policy Uploads."""
import os
from typing import Dict, Any, List

class PDFParser:
    @staticmethod
    def extract_text(file_path: str) -> str:
        if not os.path.exists(file_path):
            return ""
        text = ""
        try:
            import pdfplumber
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    extract = page.extract_text()
                    if extract:
                        text += extract + "\n"
        except Exception:
            try:
                import fitz
                doc = fitz.open(file_path)
                for page in doc:
                    text += page.get_text() + "\n"
            except Exception:
                pass
        return text.strip()

pdf_parser = PDFParser()

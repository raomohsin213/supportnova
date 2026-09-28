"""Document Integrity and Policy Structure Validator."""
import os
from typing import Tuple, Dict, Any

class DocumentValidator:
    ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
    MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

    @classmethod
    def validate_file(cls, filename: str, file_size: int) -> Tuple[bool, str]:
        ext = os.path.splitext(filename)[1].lower()
        if ext not in cls.ALLOWED_EXTENSIONS:
            return False, f"Unsupported file extension '{ext}'. Allowed: {list(cls.ALLOWED_EXTENSIONS)}"
        if file_size > cls.MAX_FILE_SIZE_BYTES:
            return False, f"File exceeds maximum allowed size of 10MB (got {file_size / (1024*1024):.2f}MB)"
        return True, "File passed validation checks"

document_validator = DocumentValidator()

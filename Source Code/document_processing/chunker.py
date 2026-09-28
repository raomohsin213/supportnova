"""Semantic Policy Document Chunker."""
import re
from typing import List, Dict, Any

class DocumentChunker:
    @staticmethod
    def chunk_policy(text: str, doc_id: str, chunk_size: int = 500) -> List[Dict[str, Any]]:
        if not text:
            return []
        
        # Split by sections if formatted
        sections = re.split(r'(Section\s+\d+[.\d]*\s*[-:]?[^\n]*)', text, flags=re.IGNORECASE)
        chunks = []
        if len(sections) > 1:
            for i in range(1, len(sections), 2):
                heading = sections[i].strip()
                content = sections[i+1].strip() if i+1 < len(sections) else ""
                chunks.append({
                    "chunk_id": f"{doc_id}-CHK-{len(chunks)+1:03d}",
                    "doc_id": doc_id,
                    "section_id": heading,
                    "heading": heading,
                    "content": f"{heading}\n{content}".strip()
                })
        else:
            # Fallback paragraph chunking
            paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 40]
            for idx, p in enumerate(paragraphs):
                chunks.append({
                    "chunk_id": f"{doc_id}-CHK-{idx+1:03d}",
                    "doc_id": doc_id,
                    "section_id": f"Paragraph {idx+1}",
                    "heading": f"{doc_id} Section {idx+1}",
                    "content": p
                })
        return chunks

document_chunker = DocumentChunker()

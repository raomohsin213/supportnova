import re
from pathlib import Path
from typing import Dict, List, Any, Tuple
import pdfplumber
import docx

class DocumentParserService:
    """
    Parses PDF and DOCX policy documents into logically chunked sections.
    Ensures traceable citation identifiers (doc_id, section_id, version, status).
    """

    @staticmethod
    def extract_text_from_pdf(file_path: Path | str) -> str:
        text_lines = []
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_lines.append(page_text)
        return "\n".join(text_lines)

    @staticmethod
    def extract_text_from_docx(file_path: Path | str) -> str:
        doc = docx.Document(file_path)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n".join(paragraphs)

    @classmethod
    def parse_document_text(cls, file_path: Path | str) -> Tuple[str, str]:
        path = Path(file_path)
        suffix = path.suffix.lower()
        if suffix == ".pdf":
            return cls.extract_text_from_pdf(path), "pdf"
        elif suffix in [".docx", ".doc"]:
            return cls.extract_text_from_docx(path), "docx"
        elif suffix in [".txt", ".md"]:
            return path.read_text(encoding="utf-8"), "text"
        else:
            raise ValueError(f"Unsupported file format: {suffix}. Expected .pdf or .docx")

    @classmethod
    def extract_metadata_and_chunks(
        cls,
        text: str,
        default_doc_id: str = "POL-001",
        default_title: str = "Standard Operating Policy",
        default_version: str = "v1.0-Active",
        default_effective_date: str = "2026-01-01",
        default_category: str = "General",
        default_status: str = "Active"
    ) -> Dict[str, Any]:
        """
        Scans text for header metadata, then splits document logically by section headings.
        """
        lines = [line.strip() for line in text.split("\n")]
        
        doc_id = default_doc_id
        doc_title = default_title
        version = default_version
        effective_date = default_effective_date
        category = default_category
        status = default_status
        
        # Metadata pattern extractors
        meta_id_match = re.search(r'(?:Policy\s*ID|Doc\s*ID|Document\s*ID)\s*[:=-]\s*([A-Z0-9\-_]+)', text, re.IGNORECASE)
        if meta_id_match:
            doc_id = re.sub(r'[*_]', '', meta_id_match.group(1)).strip()
            
        meta_title_match = re.search(r'(?:Title|Policy\s*Name|Document\s*Title)\s*[:=-]\s*([^\|\n\r]+)', text, re.IGNORECASE)
        if meta_title_match:
            doc_title = re.sub(r'[*_]', '', meta_title_match.group(1)).strip()
            
        meta_ver_match = re.search(r'(?:Version|Ver)\s*[:=-]\s*([^\|\n\r]+)', text, re.IGNORECASE)
        if meta_ver_match:
            version_raw = re.sub(r'[*_]', '', meta_ver_match.group(1)).strip()
            version = version_raw
            if "superseded" in version_raw.lower():
                status = "Superseded"
            elif "deprecated" in version_raw.lower():
                status = "Deprecated"
            elif "active" in version_raw.lower():
                status = "Active"

        meta_status_match = re.search(r'(?:Status)\s*[:=-]\s*([^\|\n\r]+)', text, re.IGNORECASE)
        if meta_status_match:
            st = re.sub(r'[*_]', '', meta_status_match.group(1)).strip()
            if st in ["Active", "Superseded", "Deprecated"]:
                status = st
                
        meta_date_match = re.search(r'(?:Effective\s*Date|Date)\s*[:=-]\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[A-Za-z]+\s+[0-9]{1,2},?\s+[0-9]{4})', text, re.IGNORECASE)
        if meta_date_match:
            effective_date = meta_date_match.group(1).strip()

        meta_cat_match = re.search(r'(?:Category|Domain)\s*[:=-]\s*([^\|\n\r]+)', text, re.IGNORECASE)
        if meta_cat_match:
            category = re.sub(r'[*_]', '', meta_cat_match.group(1)).strip()

        # Logical section regex (e.g. "Section 1.0", "Section 5.2", "## Section 1.0", "Clause 4", "DEL-POL-04, Section 5.2", "### 2. Refund Eligibility")
        section_pattern = re.compile(
            r'^(?:#{1,4}\s*)?(?:(?:Section|Clause|Article|Rule)\s+([0-9]+(?:\.[0-9]+)*)|([0-9]+(?:\.[0-9]+)+)\s+([A-Za-z0-9\s\-_/]+)|([A-Z0-9\-_]+,\s*Section\s+[0-9]+(?:\.[0-9]+)*))\b',
            re.IGNORECASE
        )
        
        chunks: List[Dict[str, Any]] = []
        current_section_id = None
        current_heading = None
        current_lines: List[str] = []
        
        def save_current_chunk():
            nonlocal current_lines, current_section_id, current_heading
            content_str = "\n".join(current_lines).strip()
            # If no section ID set yet, this is preamble/header
            if current_section_id is None:
                cleaned_intro = [l for l in current_lines if not re.match(r'^(#|\*\*Doc|\*\*Ver|\*\*Cat|\*\*Eff|\*\*Status)', l.strip(), re.IGNORECASE)]
                intro_text = "\n".join(cleaned_intro).strip()
                if intro_text and len(intro_text) > 40:
                    sec_id = "Section 1.0 - Overview"
                    sec_head = "Overview & Scope"
                    slug = "section_1_0_overview"
                    chunks.append({
                        "chunk_id": f"{doc_id}#{slug}",
                        "doc_id": doc_id,
                        "section_id": sec_id,
                        "heading": sec_head,
                        "content": intro_text,
                        "category": category,
                        "version": version,
                        "status": status
                    })
                current_lines = []
                return

            if content_str and len(content_str) > 20:
                slug = re.sub(r'[^a-zA-Z0-9]', '_', current_section_id).lower().strip('_')
                chunk_id = f"{doc_id}#{slug}"
                chunks.append({
                    "chunk_id": chunk_id,
                    "doc_id": doc_id,
                    "section_id": current_section_id,
                    "heading": current_heading,
                    "content": content_str,
                    "category": category,
                    "version": version,
                    "status": status
                })
            current_lines = []

        for line in lines:
            clean_line = line.strip()
            if not clean_line or clean_line == "---":
                continue
            
            # Check for section match
            sec_match = section_pattern.match(clean_line)
            if sec_match:
                save_current_chunk()
                # Parse section ID and heading from line
                trimmed = re.sub(r'^#{1,4}\s*', '', clean_line).strip()
                split_match = re.split(r'\s*[:—–\-]\s*', trimmed, maxsplit=1)
                if len(split_match) == 2 and split_match[1].strip():
                    current_section_id = split_match[0].strip()
                    current_heading = split_match[1].strip()
                else:
                    current_section_id = trimmed
                    current_heading = trimmed
                current_lines.append(trimmed)
            else:
                current_lines.append(clean_line)

        save_current_chunk()

        # If no explicit sections found, split by double newlines or create a single logical section
        if not chunks and text.strip():
            chunks.append({
                "chunk_id": f"{doc_id}#sec1",
                "doc_id": doc_id,
                "section_id": "Section 1.0 - General Policy",
                "heading": doc_title,
                "content": text.strip(),
                "category": category,
                "version": version,
                "status": status
            })

        return {
            "doc_id": doc_id,
            "doc_title": doc_title,
            "version": version,
            "effective_date": effective_date,
            "category": category,
            "status": status,
            "chunks": chunks
        }

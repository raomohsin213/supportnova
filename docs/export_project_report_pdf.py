"""
export_project_report_pdf.py
Converts docs/PROJECT_REPORT.md into a finalized, high-quality PDF report (docs/PROJECT_REPORT.pdf)
using ReportLab with cover page, diagrams, formatted tables, and page numbering.
"""

import os
import re
from datetime import datetime
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, Preformatted, KeepTogether, Image as RLImage
)
from reportlab.pdfgen import canvas
from PIL import Image as PILImage

DOCS_DIR = Path(__file__).resolve().parent
ROOT_DIR = DOCS_DIR.parent
MD_PATH = DOCS_DIR / "PROJECT_REPORT.md"
PDF_PATH = DOCS_DIR / "PROJECT_REPORT.pdf"

INDIGO  = colors.HexColor("#4F46E5")
NAVY    = colors.HexColor("#1E1B4B")
SLATE   = colors.HexColor("#334155")
MUTED   = colors.HexColor("#64748B")
LIGHT   = colors.HexColor("#F8FAFC")
BORDER  = colors.HexColor("#E2E8F0")
BLACK   = colors.HexColor("#0F172A")
CODE_BG = colors.HexColor("#0F172A")
CODE_FG = colors.HexColor("#E2E8F0")
EMERALD = colors.HexColor("#047857")

class NumberedCanvas(canvas.Canvas):
    """Adds running headers and footers with total page count."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        if self._pageNumber == 1:
            return  # Suppress headers/footers on cover page
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(MUTED)
        
        # Running Header
        self.drawString(2 * cm, 28.5 * cm, "SupportNova — Architectural Master Report (TechWiz 7)")
        self.setStrokeColor(BORDER)
        self.setLineWidth(0.5)
        self.line(2 * cm, 28.3 * cm, 19 * cm, 28.3 * cm)
        
        # Running Footer
        page_str = f"Page {self._pageNumber} of {total_pages}"
        self.drawRightString(19 * cm, 1.2 * cm, page_str)
        self.drawString(2 * cm, 1.2 * cm, "CONFIDENTIAL — APTECH TECHWIZ 7 COMPETITION DELIVERABLE")
        self.line(2 * cm, 1.5 * cm, 19 * cm, 1.5 * cm)
        self.restoreState()


def build_report_pdf():
    print(f"[PDF Export] Reading markdown source: {MD_PATH}...")
    with open(MD_PATH, "r", encoding="utf-8") as f:
        md_text = f.read()

    doc = SimpleDocTemplate(
        str(PDF_PATH),
        pagesize=A4,
        leftMargin=2*cm,
        rightMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )

    story = []
    style_seq = [0]

    def make_style(fontName="Helvetica", fontSize=9, leading=14, textColor=SLATE, **kwargs):
        style_seq[0] += 1
        cfg = {"fontName": fontName, "fontSize": fontSize, "leading": leading, "textColor": textColor}
        cfg.update(kwargs)
        return ParagraphStyle(f"st_{style_seq[0]}", **cfg)

    # -------------------------------------------------------------
    # COVER PAGE
    # -------------------------------------------------------------
    story.append(Spacer(1, 40))
    cover_table = Table([[
        Paragraph(
            '<font color="#FFFFFF" size="24"><b>SUPPORTNOVA</b></font><br/>'
            '<font color="#C7D2FE" size="13">Enterprise AI Complaint Intelligence & Autonomous Governance System</font>',
            make_style(fontName="Helvetica-Bold", fontSize=24, leading=30, textColor=colors.white)
        )
    ]], colWidths=["100%"])
    cover_table.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), NAVY),
        ("TOPPADDING",    (0, 0), (-1, -1), 32),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 32),
        ("LEFTPADDING",   (0, 0), (-1, -1), 24),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 24),
    ]))
    story.append(cover_table)
    story.append(Spacer(1, 24))

    meta_rows = [
        ["Document Title",  "Complete Architectural & Implementation Master Report"],
        ["Competition",     "Aptech TechWiz 7 — Theme: ResponseX Intelligence (Generative AI PowerPlay)"],
        ["SRS Compliance",  "Version 1.0 (Section 1.10 Item 1, Section 1.2, Section 1.6, Section 1.8)"],
        ["Architecture",    "Dual-Pipeline Autonomous AI Governance (Probabilistic GenAI + Deterministic Zero-AI)"],
        ["Lead Technology", "Python 3.11+ / FastAPI / SQLAlchemy / SQLite / Gemini 2.0 Flash / React 19 / Vite"],
        ["Target Domain",   "NovaTech Global Hardware & Electronics (Customer Operations)"],
        ["Status",          "Official Competition Deliverable — Final Verified Release"],
        ["Date of Release", datetime.now().strftime("%d %B %Y")],
    ]
    t_meta = Table(meta_rows, colWidths=["32%", "68%"])
    t_meta.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (0, -1), LIGHT),
        ("FONTNAME",      (0, 0), (0, -1), "Helvetica-Bold"),
        ("TEXTCOLOR",     (0, 0), (0, -1), MUTED),
        ("FONTSIZE",      (0, 0), (-1, -1), 9),
        ("GRID",          (0, 0), (-1, -1), 0.5, BORDER),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING",   (0, 0), (-1, -1), 12),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 12),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [LIGHT, colors.white]),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 30))

    highlight_box = Table([[
        Paragraph(
            '<b>Core Architectural Thesis:</b><br/>'
            '<i>"The AI Writes, but Pure Python Checks and Holds the Keys."</i><br/>'
            '<font size="8" color="#64748B">A rigorous separation between creative probabilistic LLM drafting '
            'and 100% deterministic Python rule enforcement, preventing prompt injection attacks, '
            'hallucinated citations, and unauthorized financial payouts.</font>',
            make_style(fontName="Helvetica", fontSize=9.5, leading=15, textColor=SLATE)
        )
    ]], colWidths=["100%"])
    highlight_box.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), colors.HexColor("#EEF2FF")),
        ("BOX",           (0, 0), (-1, -1), 1, colors.HexColor("#C7D2FE")),
        ("TOPPADDING",    (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
        ("LEFTPADDING",   (0, 0), (-1, -1), 16),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 16),
    ]))
    story.append(highlight_box)
    story.append(PageBreak())

    # -------------------------------------------------------------
    # PARSE & RENDER MARKDOWN CONTENT
    # -------------------------------------------------------------
    def sanitize_diagram_ascii(text: str) -> str:
        """Replaces Unicode box-drawing characters and arrows with crisp ASCII equivalents."""
        replacements = [
            ('├── ', '|-- '),
            ('└── ', '\\-- '),
            ('│   ', '|   '),
            ('│', '|'),
            ('─', '-'),
            ('═', '='),
            ('║', '|'),
            ('┌', '+'),
            ('┐', '+'),
            ('└', '+'),
            ('┘', '+'),
            ('├', '+'),
            ('┤', '+'),
            ('┬', '+'),
            ('┴', '+'),
            ('┼', '+'),
            ('╔', '+'),
            ('╗', '+'),
            ('╚', '+'),
            ('╝', '+'),
            ('╠', '+'),
            ('╣', '+'),
            ('╦', '+'),
            ('╩', '+'),
            ('╬', '+'),
            ('►', '>'),
            ('◄', '<'),
            ('▼', 'v'),
            ('▲', '^'),
            ('→', '->'),
            ('←', '<-'),
            ('•', '*'),
            ('■', '#'),
        ]
        for orig, repl in replacements:
            text = text.replace(orig, repl)
        return text

    def format_inline_markdown(text: str) -> str:
        """Converts inline markdown formatting and strips unsightly local file paths."""
        # 1. Strip local file:/// paths and file:/// links:
        # e.g. ([`JudgeGuideModal.jsx`](file:///c:/Users/...)) -> (JudgeGuideModal.jsx)
        text = re.sub(r'\(\s*\[`?([^\]`]+)`?\]\(file:///[^\)]+\)\s*\)', r'(\1)', text)
        text = re.sub(r'\[`?([^\]`]+)`?\]\(file:///[^\)]+\)', r'\1', text)
        text = re.sub(r'file:///[^\s\)\"\'>]+', '', text)

        # 2. Convert web links [Label](https://...) -> <a href="..."><u>Label</u></a>
        text = re.sub(r'\[([^\]]+)\]\((https?://[^\)]+)\)', r'<a href="\2" color="#4F46E5"><u>\1</u></a>', text)

        # 3. Strip any internal relative markdown links [Label](relative/path) -> Label
        text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)

        # 4. Bold, Italic, Code font
        text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
        text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
        text = re.sub(r'`(.*?)`', r'<font face="Courier" size="8">\1</font>', text)

        # 5. Clean up any empty parentheses left from stripped paths
        text = text.replace(' ()', '').replace('()', '')
        return text

    lines = md_text.splitlines()
    in_code_block = False
    code_lines = []
    code_lang = ""

    # Skip first 6 lines of md (title already on cover)
    start_idx = 0
    for idx, line in enumerate(lines):
        if line.startswith("## Table of Contents"):
            start_idx = idx
            break

    i = start_idx
    while i < len(lines):
        line = lines[i]

        # Handle Code / Diagram Blocks (``` ... ```)
        if line.strip().startswith("```"):
            if not in_code_block:
                in_code_block = True
                code_lang = line.strip()[3:].strip()
                code_lines = []
            else:
                in_code_block = False
                diagram_code = sanitize_diagram_ascii("\n".join(code_lines))
                
                # Check line count
                n_lines = len(code_lines)
                font_sz = 5.8 if n_lines > 40 else (6.5 if n_lines > 25 else 7.5)
                lead = 7.8 if n_lines > 40 else (9.0 if n_lines > 25 else 10.5)
                
                # Format code/diagram block cleanly
                p_code = Preformatted(
                    diagram_code,
                    ParagraphStyle(
                        f"code_{style_seq[0]}",
                        fontName="Courier",
                        fontSize=font_sz,
                        leading=lead,
                        textColor=CODE_FG,
                        leftIndent=6,
                        rightIndent=6
                    )
                )
                t_code = Table([[p_code]], colWidths=["100%"])
                t_code.setStyle(TableStyle([
                    ("BACKGROUND",    (0, 0), (-1, -1), CODE_BG),
                    ("BOX",           (0, 0), (-1, -1), 1, colors.HexColor("#334155")),
                    ("TOPPADDING",    (0, 0), (-1, -1), 8),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                    ("LEFTPADDING",   (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
                ]))
                story.append(t_code)
                story.append(Spacer(1, 10))
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # Horizontal Rule
        if line.strip() in ["---", "***", "___"]:
            story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER, spaceBefore=8, spaceAfter=8))
            i += 1
            continue

        # Headings
        if line.startswith("## "):
            h_text = line[3:].strip()
            h_text = re.sub(r'\{#.*?\}', '', h_text).strip()
            h_text = format_inline_markdown(h_text)
            story.append(Spacer(1, 14))
            story.append(Paragraph(
                f'<font color="#1E1B4B"><b>{h_text}</b></font>',
                make_style(fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=NAVY, spaceBefore=8, spaceAfter=6)
            ))
            story.append(HRFlowable(width="100%", thickness=1.5, color=INDIGO, spaceBefore=2, spaceAfter=8))
            i += 1
            continue

        if line.startswith("### "):
            h_text = line[4:].strip()
            h_text = format_inline_markdown(h_text)
            story.append(Spacer(1, 10))
            story.append(Paragraph(
                f'<font color="#0F172A"><b>{h_text}</b></font>',
                make_style(fontName="Helvetica-Bold", fontSize=11, leading=15, textColor=BLACK, spaceBefore=6, spaceAfter=4)
            ))
            i += 1
            continue

        if line.startswith("#### "):
            h_text = line[5:].strip()
            h_text = format_inline_markdown(h_text)
            story.append(Spacer(1, 6))
            story.append(Paragraph(
                f'<font color="#4F46E5"><b>{h_text}</b></font>',
                make_style(fontName="Helvetica-Bold", fontSize=9.5, leading=13, textColor=INDIGO, spaceBefore=4, spaceAfter=3)
            ))
            i += 1
            continue

        # Blockquote (> text)
        if line.startswith("> "):
            bq_text = line[2:].strip()
            bq_text = format_inline_markdown(bq_text)
            t_bq = Table([[Paragraph(bq_text, make_style(fontName="Helvetica-Oblique", fontSize=8.5, leading=13, textColor=SLATE))]], colWidths=["100%"])
            t_bq.setStyle(TableStyle([
                ("BACKGROUND",    (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
                ("LINELEFT",      (0, 0), (-1, -1), 3, INDIGO),
                ("TOPPADDING",    (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING",   (0, 0), (-1, -1), 10),
                ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
            ]))
            story.append(t_bq)
            story.append(Spacer(1, 6))
            i += 1
            continue

        # Markdown Tables (| col1 | col2 |)
        if line.strip().startswith("|") and "|" in line.strip()[1:]:
            table_rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                r_line = lines[i].strip()
                # Check if it's separator row (|---|---|)
                if re.match(r'^\|[\s\-:]+(\|[\s\-:]+)+\|$', r_line):
                    i += 1
                    continue
                cells = [c.strip() for c in r_line.strip("|").split("|")]
                formatted_cells = []
                is_header = len(table_rows) == 0
                for cell in cells:
                    cell_html = format_inline_markdown(cell)
                    cell_html = cell_html.replace("<br>", "<br/>")
                    
                    font_style = make_style(
                        fontName="Helvetica-Bold" if is_header else "Helvetica",
                        fontSize=8,
                        leading=11,
                        textColor=colors.white if is_header else SLATE
                    )
                    formatted_cells.append(Paragraph(cell_html, font_style))
                table_rows.append(formatted_cells)
                i += 1

            if table_rows:
                n_cols = max(len(r) for r in table_rows)
                # Normalize row cell count
                for r in table_rows:
                    while len(r) < n_cols:
                        r.append(Paragraph("", make_style()))
                
                col_w = f"{100 / n_cols}%"
                t_grid = Table(table_rows, colWidths=[col_w] * n_cols)
                t_grid.setStyle(TableStyle([
                    ("BACKGROUND",    (0, 0), (-1, 0), BLACK),
                    ("GRID",          (0, 0), (-1, -1), 0.5, BORDER),
                    ("TOPPADDING",    (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                    ("LEFTPADDING",   (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
                    ("VALIGN",        (0, 0), (-1, -1), "TOP"),
                ]))
                story.append(t_grid)
                story.append(Spacer(1, 8))
            continue

        # Bullet lists (- or *)
        if line.strip().startswith("- ") or line.strip().startswith("* "):
            b_text = line.strip()[2:].strip()
            b_text = format_inline_markdown(b_text)
            story.append(Paragraph(
                f"&bull;  {b_text}",
                make_style(fontName="Helvetica", fontSize=8.5, leading=13, textColor=SLATE, leftIndent=12, spaceAfter=2)
            ))
            i += 1
            continue

        # Numbered lists (1. or 2.)
        m_num = re.match(r'^(\d+)\.\s+(.*)$', line.strip())
        if m_num:
            num = m_num.group(1)
            n_text = m_num.group(2)
            n_text = format_inline_markdown(n_text)
            story.append(Paragraph(
                f"<b>{num}.</b>  {n_text}",
                make_style(fontName="Helvetica", fontSize=8.5, leading=13, textColor=SLATE, leftIndent=12, spaceAfter=2)
            ))
            i += 1
            continue

        # Embedded Markdown Images: ![caption](image_path)
        m_img = re.match(r'^!\[(.*?)\]\((.*?)\)$', line.strip())
        if m_img:
            caption = m_img.group(1).strip()
            rel_path = m_img.group(2).strip()

            img_file = (DOCS_DIR / rel_path).resolve()
            if not img_file.exists():
                img_file = (ROOT_DIR / rel_path).resolve()

            if img_file.exists():
                try:
                    with PILImage.open(img_file) as pimg:
                        pw, ph = pimg.size

                    max_w = 16.0 * cm
                    max_h = 9.2 * cm
                    aspect = ph / pw
                    target_w = max_w
                    target_h = target_w * aspect
                    if target_h > max_h:
                        target_h = max_h
                        target_w = target_h / aspect

                    rl_img = RLImage(str(img_file), width=target_w, height=target_h)
                    caption_para = Paragraph(
                        f'<b>Figure:</b> {caption}',
                        make_style(fontName="Helvetica-Oblique", fontSize=8, leading=11, textColor=MUTED, alignment=TA_CENTER)
                    )

                    fig_table = Table([[rl_img], [caption_para]], colWidths=[target_w])
                    fig_table.setStyle(TableStyle([
                        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                        ("TOPPADDING", (0, 0), (-1, -1), 4),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                        ("LEFTPADDING", (0, 0), (-1, -1), 4),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                        ("BOX", (0, 0), (-1, -1), 0.75, BORDER),
                        ("BACKGROUND", (0, 1), (-1, 1), LIGHT),
                    ]))

                    story.append(Spacer(1, 8))
                    story.append(KeepTogether(fig_table))
                    story.append(Spacer(1, 8))
                except Exception as ex:
                    print(f"[PDF Export] Warning: Failed to render image {img_file}: {ex}")
            else:
                print(f"[PDF Export] Warning: Image file not found: {img_file}")

            i += 1
            continue

        # Normal Paragraphs
        if line.strip():
            p_text = format_inline_markdown(line.strip())
            story.append(Paragraph(
                p_text,
                make_style(fontName="Helvetica", fontSize=8.5, leading=13, textColor=SLATE, spaceAfter=4)
            ))
        else:
            story.append(Spacer(1, 3))

        i += 1

    print(f"[PDF Export] Building document with {len(story)} flowable elements...")
    doc.build(story, canvasmaker=NumberedCanvas)
    sz = PDF_PATH.stat().st_size
    print(f"[PDF Export] SUCCESS: {PDF_PATH} ({sz:,} bytes)")
    return PDF_PATH

if __name__ == "__main__":
    build_report_pdf()

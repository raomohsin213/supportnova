"""
generate_test_pdfs.py
Generates two realistic PDFs for SupportNova testing:
  1. samsung_s24_ultra_complaint.pdf  -- Customer complaint form
  2. policy_document_POL_MOB_2026.pdf -- Corporate policy document
"""

import os
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    HRFlowable,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

# ---------------------------------------------------------------
# SHARED HELPERS
# ---------------------------------------------------------------
ROOT = os.path.dirname(os.path.abspath(__file__))
NOW  = datetime.now().strftime("%d %B %Y")

INDIGO  = colors.HexColor("#4F46E5")
ROSE    = colors.HexColor("#F43F5E")
EMERALD = colors.HexColor("#047857")
SLATE   = colors.HexColor("#334155")
MUTED   = colors.HexColor("#64748B")
LIGHT   = colors.HexColor("#F6F8FC")
BORDER  = colors.HexColor("#E2E8F0")
BLACK   = colors.HexColor("#0F172A")
AMBER   = colors.HexColor("#B45309")


def hr(color=BORDER, thickness=0.5, spBefore=4, spAfter=4):
    return HRFlowable(width="100%", thickness=thickness,
                      color=color, spaceAfter=spAfter, spaceBefore=spBefore)


def sp(h=6):
    return Spacer(1, h)


# ===============================================================
# PDF 1 -- CUSTOMER COMPLAINT FORM
# ===============================================================
def build_complaint_pdf():
    path = os.path.join(ROOT, "samsung_s24_ultra_complaint.pdf")
    doc  = SimpleDocTemplate(
        path, pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=2*cm,  bottomMargin=2*cm,
    )

    story = []

    # -- HEADER BANNER ------------------------------------------
    header_table = Table(
        [[
            Paragraph(
                '<font color="#FFFFFF"><b>SUPPORTNOVA</b></font>'
                '<br/><font color="#C7D2FE" size="8">Autonomous AI Complaint Intelligence System</font>',
                ParagraphStyle("hdr", fontName="Helvetica-Bold", fontSize=16,
                               leading=22, textColor=colors.white, alignment=TA_LEFT)
            ),
            Paragraph(
                '<font color="#C7D2FE" size="8">COMPLAINT REFERENCE</font><br/>'
                '<font color="#FFFFFF"><b>TICK-92833627</b></font><br/>'
                '<font color="#C7D2FE" size="8">Submitted: ' + NOW + '</font>',
                ParagraphStyle("hdrR", fontName="Helvetica", fontSize=9,
                               leading=14, textColor=colors.white, alignment=TA_RIGHT)
            ),
        ]],
        colWidths=["60%", "40%"],
    )
    header_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), INDIGO),
        ("TOPPADDING",    (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
        ("LEFTPADDING",   (0, 0), (-1, -1), 16),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 16),
    ]))
    story.append(header_table)
    story.append(sp(14))

    # -- PRIORITY BADGE -----------------------------------------
    badge = Table([[
        Paragraph('<b>P1 CRITICAL</b> -- 2-Hour SLA Target Active',
                  ParagraphStyle("badge", fontName="Helvetica-Bold", fontSize=10,
                                 textColor=ROSE, alignment=TA_LEFT)),
        Paragraph('<font color="#BE123C"><b>STATUS: Quarantine Locked</b></font>',
                  ParagraphStyle("badgeR", fontName="Helvetica-Bold", fontSize=10,
                                 textColor=ROSE, alignment=TA_RIGHT)),
    ]], colWidths=["60%", "40%"])
    badge.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), colors.HexColor("#FFF1F2")),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING",   (0, 0), (-1, -1), 12),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 12),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#FECDD3")),
    ]))
    story.append(badge)
    story.append(sp(14))

    def section_heading(text):
        return Paragraph(
            '<font color="#0F172A"><b>' + text + '</b></font>',
            ParagraphStyle("sh", fontName="Helvetica-Bold", fontSize=11,
                           textColor=BLACK, spaceBefore=10, spaceAfter=4)
        )

    def field_table(rows, col_widths=None):
        if col_widths is None:
            col_widths = ["38%", "62%"]
        t = Table(rows, colWidths=col_widths)
        t.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (0, -1), LIGHT),
            ("BACKGROUND",    (1, 0), (1, -1), colors.white),
            ("TEXTCOLOR",     (0, 0), (0, -1), MUTED),
            ("FONTNAME",      (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTNAME",      (1, 0), (1, -1), "Helvetica"),
            ("FONTSIZE",      (0, 0), (-1, -1), 9),
            ("TOPPADDING",    (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ("LEFTPADDING",   (0, 0), (-1, -1), 10),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
            ("GRID",          (0, 0), (-1, -1), 0.5, BORDER),
            ("ROWBACKGROUNDS", (0, 0), (-1, -1), [LIGHT, colors.white]),
        ]))
        return t

    # -- SECTION 1: CUSTOMER INFORMATION ------------------------
    story.append(section_heading("1. Customer Information"))
    story.append(hr(INDIGO, 1.5))
    story.append(sp(4))
    story.append(field_table([
        ["Full Name",          "Sarah Jenkins"],
        ["Email Address",      "sarah.jenkins@email.com"],
        ["Phone Number",       "+1 (555) 847-2291"],
        ["Customer ID",        "CUST-SJ-00421"],
        ["Account Type",       "Premium Member -- Verified"],
        ["Complaint Date",     NOW],
        ["Submission Channel", "NovaStore Web Portal"],
    ]))
    story.append(sp(12))

    # -- SECTION 2: PRODUCT & ORDER DETAILS --------------------
    story.append(section_heading("2. Product & Order Details"))
    story.append(hr(INDIGO, 1.5))
    story.append(sp(4))
    story.append(field_table([
        ["Product Name",    "Samsung Galaxy S24 Ultra -- Titanium Black, 512 GB"],
        ["Order Reference", "ORD-98421-SNX"],
        ["Order Date",      "14 September 2026"],
        ["Delivery Date",   "18 September 2026"],
        ["Invoice Total",   "PKR 389,999 / USD 1,399"],
        ["Warranty Status", "Active -- 24-Month International Warranty"],
        ["Serial Number",   "R5CXA04ABCD"],
        ["IMEI",            "352 819 11 123456 7"],
        ["Purchase Location", "NovaStore Flagship -- Karachi, Pakistan"],
    ]))
    story.append(sp(12))

    # -- SECTION 3: COMPLAINT DETAILS --------------------------
    story.append(section_heading("3. Complaint Details"))
    story.append(hr(ROSE, 1.5))
    story.append(sp(4))
    story.append(field_table([
        ["Complaint Title",       "Battery Overheating & Physical Swelling -- Safety Hazard"],
        ["Issue Category",        "Hardware Defect / Safety Critical"],
        ["Urgency Level",         "CRITICAL -- Physical Safety Risk"],
        ["Priority (AI Triage)",  "P1 (2-Hour SLA)"],
        ["Priority (Verified)",   "P1 -- Confirmed by Ground-Truth Pipeline"],
        ["Department Assigned",   "Hardware QA & Emergency Response"],
        ["Applicable Policy",     "HW-POL-07 Section 4.2 -- Thermal Safety & Battery Defect"],
    ]))
    story.append(sp(10))

    story.append(Paragraph(
        '<b>Detailed Complaint Statement:</b>',
        ParagraphStyle("lbl", fontName="Helvetica-Bold", fontSize=9,
                       textColor=BLACK, spaceAfter=4)
    ))
    complaint_text = (
        "I purchased a Samsung Galaxy S24 Ultra from your NovaStore on 14 September 2026. "
        "After only 9 days of standard use, the device began exhibiting severe overheating even during "
        "light usage such as browsing and calls. By 22 September 2026, the rear panel of the phone "
        "showed visible physical swelling near the bottom edge -- a clear indication of a defective or "
        "failing lithium-ion battery cell.<br/><br/>"
        "The battery temperature reached 54 degrees Celsius during a standard 15-minute call. The device "
        "now charges extremely slowly (0 to 20% in 45 minutes on original 45W charger) and intermittently "
        "shuts down at 35% battery. I am deeply concerned about the safety risk -- a swollen Li-ion battery "
        "poses fire and explosion hazards.<br/><br/>"
        "I immediately stopped using the device and am filing this urgent complaint requesting "
        "an immediate replacement under your warranty policy or a full refund. I have photo evidence "
        "of the swelling attached to this complaint."
    )
    story.append(Paragraph(
        complaint_text,
        ParagraphStyle("body", fontName="Helvetica", fontSize=9, leading=14,
                       textColor=SLATE, alignment=TA_JUSTIFY,
                       borderColor=BORDER, borderWidth=0.5, borderPadding=10,
                       backColor=LIGHT)
    ))
    story.append(sp(12))

    # -- SECTION 4: AI PIPELINE ANALYSIS SUMMARY ---------------
    story.append(section_heading("4. Dual-Pipeline AI Analysis Summary"))
    story.append(hr(EMERALD, 1.5))
    story.append(sp(4))

    pipeline_table = Table([
        ["Analysis Dimension",  "Pipeline 1 (GenAI / Gemini 2.0 Flash)",  "Pipeline 2 (Ground Truth / Python)"],
        ["Issue Category",      "Hardware Defect",                          "Hardware Defect - MATCH"],
        ["Urgency",             "Medium",                                   "CRITICAL <- OVERRIDE APPLIED"],
        ["Priority",            "P3",                                       "P1 <- OVERRIDE APPLIED"],
        ["Tone Bias Detected",  "No",                                       "Yes -- Calm tone masked severity"],
        ["Policy Cited",        "HW-POL-07",                                "HW-POL-07 v2.1 (Active)"],
        ["Dispatch Status",     "Cleared",                                  "QUARANTINED -- Human Review Required"],
        ["Safety Keywords",     "Not flagged",                              "FLAGGED: swelling, overheating, 54C"],
    ], colWidths=["30%", "35%", "35%"])

    pipeline_table.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), BLACK),
        ("TEXTCOLOR",     (0, 0), (-1, 0), colors.white),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 8),
        ("BACKGROUND",    (0, 1), (0, -1), LIGHT),
        ("FONTNAME",      (0, 1), (0, -1), "Helvetica-Bold"),
        ("TEXTCOLOR",     (2, 3), (2, 4),  ROSE),
        ("TEXTCOLOR",     (2, 7), (2, 7),  ROSE),
        ("GRID",          (0, 0), (-1, -1), 0.5, BORDER),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(pipeline_table)
    story.append(sp(12))

    # -- SECTION 5: CUSTOMER RESOLUTION REQUEST ----------------
    story.append(section_heading("5. Customer Resolution Request"))
    story.append(hr(AMBER, 1.5))
    story.append(sp(4))
    story.append(field_table([
        ["Primary Request",    "Immediate Replacement -- Samsung Galaxy S24 Ultra (same spec)"],
        ["Alternative",        "Full Refund of PKR 389,999 if replacement unavailable"],
        ["Requested SLA",      "Resolution within 2 hours (P1 Critical Safety Case)"],
        ["Return Shipping",    "Prepaid courier pickup requested (defective unit hazard)"],
        ["Evidence Attached",  "Yes -- 3 high-resolution photos (battery swelling, temperature)"],
    ]))
    story.append(sp(12))

    # -- SECTION 6: DECLARATION --------------------------------
    story.append(section_heading("6. Customer Declaration"))
    story.append(hr(BORDER, 0.5))
    story.append(sp(4))
    story.append(Paragraph(
        "I, <b>Sarah Jenkins</b>, hereby declare that all information provided in this complaint is true "
        "and accurate to the best of my knowledge. I understand that SupportNova's AI Governance System "
        "will process this complaint against active corporate warranty policies and that a specialist will "
        "review the dual-pipeline analysis before any resolution is dispatched.",
        ParagraphStyle("decl", fontName="Helvetica", fontSize=9, leading=14,
                       textColor=SLATE, alignment=TA_JUSTIFY)
    ))
    story.append(sp(16))

    sig_table = Table([
        ["_________________________________", "            ", "_________________________________"],
        ["Customer Signature",               "",             "Date"],
        ["Sarah Jenkins",                    "",             NOW],
    ], colWidths=["40%", "20%", "40%"])
    sig_table.setStyle(TableStyle([
        ("FONTNAME",      (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE",      (0, 0), (-1, -1), 8),
        ("TEXTCOLOR",     (0, 1), (-1, 1),  MUTED),
        ("FONTNAME",      (0, 2), (-1, 2),  "Helvetica-Bold"),
        ("TOPPADDING",    (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("ALIGN",         (2, 0), (2, -1),  "RIGHT"),
    ]))
    story.append(sig_table)
    story.append(sp(16))

    # -- FOOTER ------------------------------------------------
    story.append(hr(BORDER))
    story.append(Paragraph(
        'SupportNova Autonomous AI Governance System  |  Complaint ID: TICK-92833627  |  '
        'Generated: ' + NOW + '  |  Confidential -- For Internal Use Only',
        ParagraphStyle("footer", fontName="Helvetica", fontSize=7,
                       textColor=MUTED, alignment=TA_CENTER)
    ))

    doc.build(story)
    print("  OK: " + path)
    return path


# ===============================================================
# PDF 2 -- CORPORATE POLICY DOCUMENT
# ===============================================================
def build_policy_pdf():
    path = os.path.join(ROOT, "policy_document_POL_MOB_2026.pdf")
    doc  = SimpleDocTemplate(
        path, pagesize=A4,
        leftMargin=2.2*cm, rightMargin=2.2*cm,
        topMargin=2*cm,    bottomMargin=2*cm,
    )

    story = []

    # -- COVER HEADER ------------------------------------------
    cover = Table([[
        Paragraph(
            '<font color="#FFFFFF" size="18"><b>SUPPORTNOVA</b></font><br/>'
            '<font color="#C7D2FE" size="9">Corporate Policy Registry -- Official Document</font>',
            ParagraphStyle("ch", fontName="Helvetica-Bold", fontSize=18,
                           leading=26, textColor=colors.white)
        )
    ]], colWidths=["100%"])
    cover.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), INDIGO),
        ("TOPPADDING",    (0, 0), (-1, -1), 20),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 20),
        ("LEFTPADDING",   (0, 0), (-1, -1), 20),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 20),
    ]))
    story.append(cover)
    story.append(sp(16))

    _p_seq = [0]

    def para(text, **kwargs):
        _p_seq[0] += 1
        cfg = {"fontName": "Helvetica", "fontSize": 9, "leading": 14, "textColor": SLATE}
        cfg.update(kwargs)
        return Paragraph(text, ParagraphStyle(f"policy_p_{_p_seq[0]}", **cfg))

    def heading1(text):
        return Paragraph(
            '<font color="#0F172A"><b>' + text + '</b></font>',
            ParagraphStyle("h1p", fontName="Helvetica-Bold", fontSize=13,
                           textColor=BLACK, spaceBefore=12, spaceAfter=4)
        )

    def info_box(rows):
        t = Table(rows, colWidths=["35%", "65%"])
        t.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (0, -1), LIGHT),
            ("FONTNAME",      (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE",      (0, 0), (-1, -1), 9),
            ("TEXTCOLOR",     (0, 0), (0, -1), MUTED),
            ("GRID",          (0, 0), (-1, -1), 0.5, BORDER),
            ("TOPPADDING",    (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING",   (0, 0), (-1, -1), 10),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
            ("ROWBACKGROUNDS", (0, 0), (-1, -1), [LIGHT, colors.white]),
        ]))
        return t

    # -- POLICY METADATA ----------------------------------------
    story.append(info_box([
        ["Policy ID",         "POL-MOB-2026"],
        ["Policy Title",      "Mobile Device Warranty, Repair & Replacement Standards 2026"],
        ["Version",           "3.1 (Active)"],
        ["Effective Date",    "01 January 2026"],
        ["Review Date",       "31 December 2026"],
        ["Approved By",       "Dr. Alexander Vance -- System Administrator, SupportNova"],
        ["Department Owner",  "Hardware QA & Customer Experience"],
        ["Compliance Ref.",   "SRS Section 1.2, 1.6, 1.8, 1.10 -- ResponseX Intelligence Framework"],
        ["Classification",    "Internal -- Restricted Distribution"],
        ["Replaces",          "POL-MOB-2025 v2.4 (Superseded 01 Jan 2026)"],
    ]))
    story.append(sp(16))

    # -- TABLE OF CONTENTS -------------------------------------
    story.append(heading1("Table of Contents"))
    story.append(hr(INDIGO, 1.5))
    story.append(sp(4))
    toc_items = [
        ("1.", "Purpose & Scope"),
        ("2.", "Definitions & Terminology"),
        ("3.", "Eligibility Criteria for Warranty Claims"),
        ("4.", "Hardware Defect Classification Matrix"),
        ("5.", "Battery Safety & Thermal Incident Protocol (Critical)"),
        ("6.", "Resolution Pathways & SLA Targets"),
        ("7.", "Prohibited Actions & Compensation Limits"),
        ("8.", "AI Governance & Dual-Pipeline Verification"),
        ("9.", "Escalation Tiers"),
        ("10.", "Policy Version Control & Audit Trail"),
    ]
    for num, title in toc_items:
        story.append(para(
            '<font color="#64748B">' + num + '</font>  <font color="#0F172A">' + title + '</font>',
            leftIndent=10
        ))
    story.append(sp(16))

    # -- SECTION 1 ---------------------------------------------
    story.append(heading1("1. Purpose & Scope"))
    story.append(hr(INDIGO, 1.5))
    story.append(sp(4))
    story.append(para(
        "This policy establishes mandatory standards, procedures, and governance rules that govern "
        "all mobile device warranty claims, repair requests, and replacement authorizations processed "
        "through the SupportNova Autonomous AI Complaint Intelligence System.",
        alignment=TA_JUSTIFY
    ))
    story.append(sp(6))
    story.append(para(
        "<b>Scope:</b> Applies to all Samsung Galaxy, Apple iPhone, and OnePlus flagship devices "
        "purchased through authorized NovaStore channels within 24 months of purchase date. "
        "Devices purchased through unauthorized resellers are excluded.",
        alignment=TA_JUSTIFY
    ))
    story.append(sp(12))

    # -- SECTION 2 ---------------------------------------------
    story.append(heading1("2. Definitions & Terminology"))
    story.append(hr(INDIGO, 1.5))
    story.append(sp(4))
    defs = [
        ["Term",          "Definition"],
        ["P1 Critical",   "Safety hazard posing immediate risk to persons or property. 2-hour SLA."],
        ["P2 Elevated",   "Significant hardware failure affecting primary device functionality. 8-hour SLA."],
        ["P3 Standard",   "Non-critical defects; intermittent faults; cosmetic damage. 24-hour SLA."],
        ["P4 Low",        "Minor inconveniences; software glitches; non-essential features. 48-hour SLA."],
        ["Ground Truth",  "100% deterministic Python validation layer -- zero AI inference involved."],
        ["Quarantine",    "Automated dispatch block applied when human specialist review is required."],
        ["Tone Decoupling","Separation of customer emotional tone from actual complaint severity level."],
        ["Traceability",  "Audit-trail linkage between complaint, policy citation, and resolution action."],
    ]
    dt = Table(defs, colWidths=["28%", "72%"])
    dt.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), BLACK),
        ("TEXTCOLOR",     (0, 0), (-1, 0), colors.white),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME",      (0, 1), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 8.5),
        ("GRID",          (0, 0), (-1, -1), 0.5, BORDER),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(dt)
    story.append(sp(12))

    # -- SECTION 3 ---------------------------------------------
    story.append(heading1("3. Eligibility Criteria for Warranty Claims"))
    story.append(hr(INDIGO, 1.5))
    story.append(sp(4))
    for item in [
        "Device purchased from an authorized NovaStore channel (online portal or physical store).",
        "Claim submitted within 24 months of confirmed delivery date.",
        "Customer provides valid order reference number and product serial number.",
        "Defect is attributable to manufacturing fault, not physical damage or unauthorized modification.",
        "Device has not been rooted, jailbroken, or had its bootloader unlocked.",
        "Liquid damage indicators inside the device are not triggered.",
        "Customer must return defective unit within 7 business days of replacement dispatch.",
    ]:
        story.append(para("  -   " + item, leftIndent=16, spaceAfter=3))
    story.append(sp(12))

    # -- SECTION 4: DEFECT MATRIX ------------------------------
    story.append(heading1("4. Hardware Defect Classification Matrix"))
    story.append(hr(INDIGO, 1.5))
    story.append(sp(4))
    matrix = [
        ["Defect Type",                        "Severity", "Priority", "SLA", "Resolution"],
        ["Battery Swelling / Thermal Runaway", "CRITICAL",  "P1",      "2h",  "Immediate Replacement"],
        ["Smoke / Spark / Burn Marks",         "CRITICAL",  "P1",      "2h",  "Emergency Recall + Replacement"],
        ["Screen OLED Failure (Black/Lines)",  "HIGH",      "P2",      "8h",  "Replacement"],
        ["Charging Port Non-Functional",       "HIGH",      "P2",      "8h",  "Repair / Replacement"],
        ["Camera Module Failure",              "MEDIUM",    "P3",      "24h", "Repair"],
        ["Speaker / Microphone Fault",         "MEDIUM",    "P3",      "24h", "Repair"],
        ["Minor Cosmetic Defects",             "LOW",       "P4",      "48h", "Assessment"],
        ["Software / App Crashes",             "LOW",       "P4",      "48h", "Remote Support"],
    ]
    mt = Table(matrix, colWidths=["32%", "14%", "10%", "8%", "36%"])
    mt.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), BLACK),
        ("TEXTCOLOR",     (0, 0), (-1, 0), colors.white),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 8),
        ("GRID",          (0, 0), (-1, -1), 0.5, BORDER),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
        ("TEXTCOLOR",     (1, 1), (2, 2),   ROSE),
        ("FONTNAME",      (1, 1), (2, 2),   "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN",         (1, 0), (3, -1),  "CENTER"),
    ]))
    story.append(mt)
    story.append(sp(12))

    # -- SECTION 5: BATTERY SAFETY -----------------------------
    story.append(heading1("5. Battery Safety & Thermal Incident Protocol"))
    story.append(hr(ROSE, 1.5))
    story.append(sp(4))

    warning_box = Table([[
        Paragraph(
            '<b>CRITICAL SAFETY PROTOCOL -- Section 5</b><br/>'
            'Battery swelling, overheating above 45 degrees Celsius during standard use, smoke, sparking, '
            'or burn marks constitute a P1 Safety Emergency. These cases MUST bypass all standard processing '
            'queues and be escalated immediately to the Emergency Response team within 30 minutes.',
            ParagraphStyle("wb", fontName="Helvetica", fontSize=9, leading=14,
                           textColor=colors.HexColor("#7F1D1D"))
        )
    ]], colWidths=["100%"])
    warning_box.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), colors.HexColor("#FEF2F2")),
        ("LEFTPADDING",   (0, 0), (-1, -1), 14),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 14),
        ("TOPPADDING",    (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("BOX",           (0, 0), (-1, -1), 1.5, ROSE),
    ]))
    story.append(warning_box)
    story.append(sp(8))

    steps = [
        "Immediately quarantine automated dispatch and flag complaint as P1 Critical.",
        "Notify Emergency Response team via priority alert within 30 minutes.",
        "Issue customer advisory to power off device immediately and store safely.",
        "Dispatch prepaid return courier within 4 hours -- do not ask customer to ship normally.",
        "Process replacement order within 2 hours of specialist authorization.",
        "File safety incident report under CAPA-SAFETY-LOG for regulatory compliance.",
        "Initiate batch quality check on same model/production lot (SRS 1.2 Compliance).",
    ]
    for i, step in enumerate(steps, 1):
        story.append(para("<b>Step " + str(i) + ":</b>  " + step,
                          leftIndent=16, spaceAfter=4))
    story.append(sp(12))

    # -- SECTION 6: SLA TARGETS --------------------------------
    story.append(heading1("6. Resolution Pathways & SLA Targets"))
    story.append(hr(INDIGO, 1.5))
    story.append(sp(4))
    sla = [
        ["Priority", "Response",   "Resolution", "Pathway",             "Escalation"],
        ["P1",       "15 min",     "2 hours",    "Emergency + Specialist","System Admin (T6)"],
        ["P2",       "1 hour",     "8 hours",    "Specialist Review",    "Senior Specialist"],
        ["P3",       "4 hours",    "24 hours",   "Standard Queue",       "Team Lead"],
        ["P4",       "8 hours",    "48 hours",   "Self-Service / Bot",   "Support Agent"],
    ]
    st = Table(sla, colWidths=["12%", "16%", "16%", "32%", "24%"])
    st.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), BLACK),
        ("TEXTCOLOR",     (0, 0), (-1, 0), colors.white),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME",      (0, 1), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 8.5),
        ("GRID",          (0, 0), (-1, -1), 0.5, BORDER),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
        ("TEXTCOLOR",     (0, 1), (0, 1),  ROSE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
        ("ALIGN",         (0, 0), (2, -1),  "CENTER"),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(st)
    story.append(sp(12))

    # -- SECTION 7: PROHIBITED ---------------------------------
    story.append(heading1("7. Prohibited Actions & Compensation Limits"))
    story.append(hr(INDIGO, 1.5))
    story.append(sp(4))
    prohibited = [
        "Direct monetary cash compensation to customer bank accounts (any amount).",
        "Compensation exceeding PKR 100,000 without System Administrator authorization.",
        "Promising replacements before specialist verification and policy clearance.",
        "Disclosing internal policy IDs, ticket IDs, or pipeline scores to customers.",
        "Closing a P1 Safety ticket without Emergency Response team sign-off.",
        "Applying more than 2 override reclassifications per ticket without admin approval.",
        "Citing deprecated or superseded policy versions (pre-2026) in resolution messages.",
    ]
    for item in prohibited:
        story.append(para("  X   " + item,
                          textColor=colors.HexColor("#7F1D1D"),
                          leftIndent=16, spaceAfter=3))
    story.append(sp(12))

    # -- SECTION 8: AI GOVERNANCE ------------------------------
    story.append(heading1("8. AI Governance & Dual-Pipeline Verification"))
    story.append(hr(INDIGO, 1.5))
    story.append(sp(4))
    story.append(para(
        "All complaints processed through SupportNova are subject to mandatory dual-pipeline AI governance "
        "as specified in SRS Section 1.2 and 1.10:",
        alignment=TA_JUSTIFY
    ))
    story.append(sp(6))

    pipes = [
        ["Pipeline",    "Technology",                    "Role",                                          "Output"],
        ["Pipeline 1",  "Gemini 2.0 Flash (GenAI)",      "Probabilistic triage, entity extraction, drafting",
         "Category, Urgency, Priority, Draft Response"],
        ["Pipeline 2",  "Pure Python -- Zero AI",        "Deterministic validation against Rule Matrix",
         "Ground-truth override, quarantine decision, traceability score"],
        ["Diff Engine", "Python Comparison",             "Field-by-field analysis of P1 vs P2 outputs",
         "Match count, mismatches, critical discrepancy flags"],
    ]
    pt = Table(pipes, colWidths=["15%", "25%", "35%", "25%"])
    pt.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), INDIGO),
        ("TEXTCOLOR",     (0, 0), (-1, 0), colors.white),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 8),
        ("GRID",          (0, 0), (-1, -1), 0.5, BORDER),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(pt)
    story.append(sp(12))

    # -- SECTION 9: ESCALATION TIERS ---------------------------
    story.append(heading1("9. Escalation Tiers"))
    story.append(hr(INDIGO, 1.5))
    story.append(sp(4))
    tiers = [
        ["Tier", "Level",                  "Trigger",                             "Authority"],
        ["T1",   "Self-Service Bot",        "P4 standard queries",                 "Automated response only"],
        ["T2",   "Support Agent",           "P3 standard complaints",              "Approve up to PKR 5,000"],
        ["T3",   "Senior Specialist",       "P2 elevated; repeat customers",       "Approve up to PKR 25,000"],
        ["T4",   "Team Lead",               "Policy ambiguity; 3+ repeat cases",   "Approve up to PKR 50,000"],
        ["T5",   "Department Head",         "Legal threats; media risk",            "Approve up to PKR 100,000"],
        ["T6",   "System Administrator",    "P1 Safety; cash >PKR 100K; AI jailbreak",
         "Full executive authority -- unlimited"],
    ]
    tt = Table(tiers, colWidths=["8%", "22%", "38%", "32%"])
    tt.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), BLACK),
        ("TEXTCOLOR",     (0, 0), (-1, 0), colors.white),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME",      (0, 1), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 8),
        ("GRID",          (0, 0), (-1, -1), 0.5, BORDER),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
        ("BACKGROUND",    (0, 6), (-1, 6), colors.HexColor("#1E1B4B")),
        ("TEXTCOLOR",     (0, 6), (-1, 6), colors.HexColor("#C7D2FE")),
        ("FONTNAME",      (0, 6), (-1, 6), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 1), (-1, 5), [colors.white, LIGHT]),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN",         (0, 0), (0, -1),  "CENTER"),
    ]))
    story.append(tt)
    story.append(sp(12))

    # -- SECTION 10: VERSION CONTROL ---------------------------
    story.append(heading1("10. Policy Version Control & Audit Trail"))
    story.append(hr(INDIGO, 1.5))
    story.append(sp(4))
    versions = [
        ["Version", "Date",          "Author",           "Change Summary"],
        ["v1.0",    "01 Jan 2024",   "Policy Team",      "Initial policy publication"],
        ["v2.0",    "01 Jan 2025",   "Dr. A. Vance",     "Added AI governance clauses (Sec 8)"],
        ["v2.4",    "15 Jun 2025",   "Dr. A. Vance",     "Battery safety protocol added (Sec 5)"],
        ["v3.0",    "01 Jan 2026",   "Dr. A. Vance",     "Complete revision -- SRS alignment"],
        ["v3.1",    "15 Mar 2026",   "Dr. A. Vance",     "SLA table updated; Tier 6 authority clarified"],
    ]
    vt = Table(versions, colWidths=["12%", "18%", "25%", "45%"])
    vt.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), BLACK),
        ("TEXTCOLOR",     (0, 0), (-1, 0), colors.white),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 8.5),
        ("GRID",          (0, 0), (-1, -1), 0.5, BORDER),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
        ("BACKGROUND",    (0, 5), (-1, 5), colors.HexColor("#ECFDF5")),
        ("TEXTCOLOR",     (0, 5), (-1, 5), EMERALD),
        ("FONTNAME",      (0, 5), (-1, 5), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 1), (-1, 4), [colors.white, LIGHT]),
    ]))
    story.append(vt)
    story.append(sp(6))
    story.append(para(
        '<font color="#047857"><b>Current Active Version: v3.1</b></font> -- '
        'All previous versions are superseded and must not be cited in resolution messages.'
    ))
    story.append(sp(16))

    # -- AUTHORIZATION SIGNATURES ------------------------------
    story.append(hr(BORDER))
    story.append(sp(10))
    auth_table = Table([
        ["_________________________________", "   ", "_________________________________"],
        ["Dr. Alexander Vance",              "",    "Policy Review Board"],
        ["System Administrator",             "",    "SupportNova Operations"],
        ["Date: " + NOW,                     "",    "Effective: 01 January 2026"],
    ], colWidths=["45%", "10%", "45%"])
    auth_table.setStyle(TableStyle([
        ("FONTNAME",      (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE",      (0, 0), (-1, -1), 8),
        ("FONTNAME",      (0, 1), (-1, 1),  "Helvetica-Bold"),
        ("TEXTCOLOR",     (0, 2), (-1, 3),  MUTED),
        ("TOPPADDING",    (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("ALIGN",         (2, 0), (2, -1),  "RIGHT"),
    ]))
    story.append(auth_table)
    story.append(sp(12))

    # -- FOOTER ------------------------------------------------
    story.append(hr(BORDER))
    story.append(Paragraph(
        'Policy ID: POL-MOB-2026  |  Version: 3.1 (Active)  |  Generated: ' + NOW + '  |  '
        'SupportNova Corporate Policy Registry  |  CONFIDENTIAL -- INTERNAL USE ONLY',
        ParagraphStyle("footer", fontName="Helvetica", fontSize=7,
                       textColor=MUTED, alignment=TA_CENTER)
    ))

    doc.build(story)
    print("  OK: " + path)
    return path


# ===============================================================
# MAIN
# ===============================================================
if __name__ == "__main__":
    print("\nSupportNova PDF Generator")
    print("=" * 55)
    p1 = build_complaint_pdf()
    p2 = build_policy_pdf()
    print("=" * 55)
    sz1 = os.path.getsize(p1)
    sz2 = os.path.getsize(p2)
    print("\nBoth PDFs generated successfully in: " + ROOT)
    print("  samsung_s24_ultra_complaint.pdf    (" + str(sz1) + " bytes)")
    print("  policy_document_POL_MOB_2026.pdf   (" + str(sz2) + " bytes)\n")

import json
import uuid
import shutil
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from datetime import datetime
from sqlalchemy import select, func, desc, or_
from app.config import settings
from app.database import get_db, SyncSessionLocal
from app.models.ticket import ComplaintTicket
from app.schemas.complaint import ComplaintInput
from app.services.genai_pipeline import genai_pipeline
from app.services.validation_engine import validation_engine
from app.services.diff_engine import diff_engine
from app.services.document_parser import DocumentParserService
from app.services.audit_service import audit_service

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.post("/submit", status_code=status.HTTP_201_CREATED)
async def submit_complaint(
    complaint_data: ComplaintInput,
    async_db: AsyncSession = Depends(get_db)
):
    """
    Submits a customer complaint across any supported intake channel (Web Form, Email, Chat, Complaint Upload),
    runs through Dual-Pipeline Architecture: Pipeline 1 (GenAI Intelligence) and Pipeline 2 (Ground-Truth Validation Engine).
    Synthesizes diff and returns full comparison inspection payload.
    """
    complaint_id = complaint_data.complaint_id or f"TICK-{uuid.uuid4().hex[:8].upper()}"
    complaint_data.complaint_id = complaint_id

    # Calculate actual historical complaint count for this customer
    actual_prev_count = 0
    if complaint_data.customer_email or complaint_data.customer_name:
        conds = []
        if complaint_data.customer_email:
            conds.append(ComplaintTicket.customer_email.ilike(complaint_data.customer_email))
        if complaint_data.customer_name:
            conds.append(ComplaintTicket.customer_name.ilike(complaint_data.customer_name))
        prev_count_stmt = select(func.count(ComplaintTicket.complaint_id)).where(or_(*conds))
        prev_count_res = await async_db.execute(prev_count_stmt)
        actual_prev_count = prev_count_res.scalar() or 0
    complaint_data.previous_complaints_count = actual_prev_count

    # 1. Pipeline 1: GenAI Probabilistic Analysis
    genai_output = await genai_pipeline.analyze(complaint_data)

    # 2. Pipeline 2: Ground-Truth Deterministic Validation
    sync_db: Session = SyncSessionLocal()
    try:
        validation_output = validation_engine.validate(complaint_data, genai_output, sync_db)
    finally:
        sync_db.close()

    # 3. Module 5: Dual-Pipeline Comparison & Diff Synthesis
    diff_summary = diff_engine.generate_diff(complaint_data, genai_output, validation_output)

    # Initial conversation thread
    initial_conv = [
        {
            "id": f"msg-init-{complaint_id}",
            "sender": "customer",
            "sender_name": complaint_data.customer_name or "Customer",
            "message": complaint_data.complaint_description,
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
            "action": "complaint_submitted"
        }
    ]

    # 4. Persistence into SQLite via async_db
    ticket = ComplaintTicket(
        complaint_id=complaint_id,
        customer_name=complaint_data.customer_name,
        customer_tier=complaint_data.customer_tier,
        channel=complaint_data.channel,
        complaint_title=complaint_data.complaint_title,
        complaint_description=complaint_data.complaint_description,
        order_reference=complaint_data.order_reference,
        transaction_date=complaint_data.transaction_date,
        previous_complaints_count=actual_prev_count,
        genai_output_json=genai_output.model_dump_json(),
        validation_output_json=validation_output.model_dump_json(),
        diff_summary_json=json.dumps(diff_summary),
        status="Quarantined" if validation_output.block_automated_dispatch else "Needs Review",
        coverage_score=validation_output.coverage_score,
        traceability_score=validation_output.traceability_score,
        routing_score=validation_output.routing_score,
        overall_confidence_score=validation_output.overall_confidence_score,
        assigned_department=validation_output.recommended_department,
        primary_department=validation_output.primary_department or validation_output.recommended_department,
        supporting_departments_json=json.dumps(validation_output.supporting_departments),
        primary_issue=validation_output.validated_primary_issue or complaint_data.complaint_title,
        secondary_issue=validation_output.validated_secondary_issue,
        product_or_service=complaint_data.product_or_service or genai_output.product_or_service,
        product_image_url=complaint_data.product_image_url,
        evidence_image_url=complaint_data.evidence_image_url,
        customer_email=complaint_data.customer_email,
        final_priority=validation_output.calculated_priority,
        final_urgency=validation_output.calculated_urgency,
        final_sentiment=genai_output.sentiment,
        escalation_level=validation_output.escalation_level,
        is_automated_dispatch_blocked=validation_output.block_automated_dispatch,
        human_reviewer_action="Quarantined - Safety/Policy Block" if validation_output.block_automated_dispatch else "Pending Specialist Approval",
        pii_masked_description=validation_engine.mask_pii(complaint_data.complaint_description),
        sla_target_hours=2 if validation_output.calculated_priority == "P1" else (8 if validation_output.calculated_priority == "P2" else (24 if validation_output.calculated_priority == "P3" else 48)),
        is_sla_at_risk=False,
        is_duplicate=validation_output.is_duplicate,
        duplicate_of_id=validation_output.duplicate_of_id,
        is_repeat_complaint=validation_output.is_repeat_complaint,
        repeat_count=validation_output.repeat_count,
        extracted_entities_json=json.dumps(validation_output.extracted_entities),
        clarification_questions_json=json.dumps(validation_output.clarification_questions),
        follow_up_message=validation_output.follow_up_message,
        conversation_history_json=json.dumps(initial_conv)
    )

    async_db.add(ticket)
    await async_db.commit()

    # Sync live ticket document to MongoDB Atlas (TechWiz 7 Primary NoSQL DB)
    try:
        from app.mongodb import sync_ticket_to_mongo
        await sync_ticket_to_mongo(ticket.to_mongo_dict())
    except Exception:
        pass

    return {
        "success": True,
        "complaint_id": complaint_id,
        "status": validation_output.final_status,
        "dispatch_blocked": validation_output.block_automated_dispatch,
        "block_reason": validation_output.reason_for_blocking,
        "scores": {
            "coverage_score": validation_output.coverage_score,
            "traceability_score": validation_output.traceability_score,
            "routing_score": validation_output.routing_score,
            "overall_confidence": validation_output.overall_confidence_score
        },
        "pipeline_1_genai": genai_output.model_dump(),
        "pipeline_2_ground_truth": validation_output.model_dump(),
        "diff_summary": diff_summary
    }

@router.post("/extract-file-text")
async def extract_complaint_file_text(
    file: UploadFile = File(...)
):
    """
    Extracts text preview from uploaded complaint letters (.pdf, .docx, .txt).
    Used for live client-side preview in the Document Upload dropzone.
    """
    filename = file.filename or "complaint.txt"
    suffix = Path(filename).suffix.lower()

    if suffix not in [".pdf", ".docx", ".doc", ".txt", ".md"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{suffix}'. Supported: .pdf, .docx, .txt"
        )

    temp_path = settings.UPLOAD_DIR / f"temp_{uuid.uuid4().hex[:6]}_{filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extracted_text, file_type = DocumentParserService.parse_document_text(temp_path)
        return {
            "success": True,
            "filename": filename,
            "file_type": file_type,
            "char_count": len(extracted_text),
            "extracted_text": extracted_text.strip(),
            "preview": extracted_text[:400].strip() + ("..." if len(extracted_text) > 400 else "")
        }
    finally:
        if temp_path.exists():
            temp_path.unlink()

@router.post("/upload-file", status_code=status.HTTP_201_CREATED)
async def upload_complaint_file(
    file: UploadFile = File(...),
    customer_name: Optional[str] = Form("Valued Customer"),
    customer_tier: Optional[str] = Form("Standard"),
    product_or_service: Optional[str] = Form(None),
    order_reference: Optional[str] = Form(None),
    transaction_date: Optional[str] = Form(None),
    complaint_title: Optional[str] = Form(None),
    async_db: AsyncSession = Depends(get_db)
):
    """
    Direct endpoint for SRS Section 1.2 & 1.6 Complaint Upload:
    Accepts .pdf, .docx, or .txt complaint files, parses text via pdfplumber / python-docx,
    and submits directly into the Dual-Pipeline Architecture.
    """
    filename = file.filename or "scanned_complaint.txt"
    suffix = Path(filename).suffix.lower()

    if suffix not in [".pdf", ".docx", ".doc", ".txt", ".md"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{suffix}'. Supported formats: .pdf, .docx, .txt"
        )

    save_path = settings.UPLOAD_DIR / f"complaint_{uuid.uuid4().hex[:6]}_{filename}"
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        extracted_text, _ = DocumentParserService.parse_document_text(save_path)
        if not extracted_text or len(extracted_text.strip()) < 5:
            raise HTTPException(status_code=400, detail="Uploaded file is empty or could not be parsed.")

        # Determine title
        derived_title = complaint_title
        if not derived_title:
            first_line = extracted_text.strip().split("\n")[0].strip()
            derived_title = first_line[:120] if len(first_line) > 5 else f"Document Complaint: {Path(filename).stem}"

        complaint_input = ComplaintInput(
            customer_name=customer_name or "Valued Customer",
            customer_tier=customer_tier or "Standard",
            channel="Complaint Upload",
            complaint_title=derived_title,
            complaint_description=extracted_text.strip(),
            product_or_service=product_or_service,
            order_reference=order_reference or f"DOC-{uuid.uuid4().hex[:6].upper()}",
            transaction_date=transaction_date,
            previous_complaints_count=0
        )

        return await submit_complaint(complaint_input, async_db)

    finally:
        if save_path.exists():
            save_path.unlink()

@router.get("/track/{complaint_id}")
async def track_complaint(
    complaint_id: str,
    async_db: AsyncSession = Depends(get_db)
):
    """
    Public customer portal status tracking (FR lxvi, Step 61).
    Returns sanitized timeline, status, and approved response without internal ground-truth diffs.
    """
    stmt = select(ComplaintTicket).where(ComplaintTicket.complaint_id == complaint_id)
    result = await async_db.execute(stmt)
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Complaint with ID '{complaint_id}' was not found.")
        
    return ticket.to_customer_dict()

@router.get("/recent-public-list")
async def recent_public_complaints(
    async_db: AsyncSession = Depends(get_db)
):
    """
    Provides a read-only list of recent complaints for the Customer Portal demo.
    """
    stmt = select(ComplaintTicket).order_by(ComplaintTicket.created_at.desc()).limit(10)
    result = await async_db.execute(stmt)
    tickets = result.scalars().all()
    return [t.to_customer_dict() for t in tickets]

@router.get("/by-customer/{identifier}")
async def get_customer_complaints(
    identifier: str,
    async_db: AsyncSession = Depends(get_db)
):
    """
    Returns all complaints for a specific customer by name or email.
    """
    ident = identifier.strip()
    stmt = (
        select(ComplaintTicket)
        .where(
            or_(
                ComplaintTicket.customer_name.ilike(f"%{ident}%"),
                ComplaintTicket.customer_email.ilike(ident)
            )
        )
        .order_by(desc(ComplaintTicket.created_at))
        .limit(100)
    )
    result = await async_db.execute(stmt)
    tickets = result.scalars().all()
    return [t.to_customer_dict() for t in tickets]

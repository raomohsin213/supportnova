import os
import shutil
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.config import settings
from app.database import get_db
from app.models.policy import PolicyDocument, PolicyChunk
from app.services.document_parser import DocumentParserService
from app.services.vector_store import vector_store

router = APIRouter(prefix="/policies", tags=["Policy Registry & Ingestion"])

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_policy(
    file: UploadFile = File(...),
    doc_id: Optional[str] = Form(None),
    doc_title: Optional[str] = Form(None),
    version: Optional[str] = Form("v1.0-Active"),
    category: Optional[str] = Form("General"),
    effective_date: Optional[str] = Form("2026-01-01"),
    policy_status: Optional[str] = Form("Active"),
    db: AsyncSession = Depends(get_db)
):
    """
    Ingests and parses .pdf or .docx policy documents.
    Extracts text, splits logically by section headings, assigns traceable chunk IDs,
    persists in SQLite, and indexes in Vector Store.
    """
    filename = file.filename or "uploaded_policy.pdf"
    suffix = Path(filename).suffix.lower()

    if suffix not in [".pdf", ".docx", ".doc", ".txt", ".md"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{suffix}'. Supported formats: .pdf, .docx"
        )

    # Save file to upload directory
    save_path = settings.UPLOAD_DIR / filename
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Extract text and parse logical sections
        raw_text, file_type = DocumentParserService.parse_document_text(save_path)
        
        parsed = DocumentParserService.extract_metadata_and_chunks(
            text=raw_text,
            default_doc_id=doc_id or Path(filename).stem.upper(),
            default_title=doc_title or Path(filename).stem.replace("_", " ").title(),
            default_version=version or "v1.0-Active",
            default_effective_date=effective_date or "2026-01-01",
            default_category=category or "General",
            default_status=policy_status or "Active"
        )

        final_doc_id = parsed["doc_id"]

        # Check if already exists; if so, replace or update
        stmt = select(PolicyDocument).where(PolicyDocument.doc_id == final_doc_id)
        result = await db.execute(stmt)
        existing = result.scalars().first()

        if existing:
            # Delete existing chunks to replace
            chunk_stmt = select(PolicyChunk).where(PolicyChunk.doc_id == final_doc_id)
            ch_res = await db.execute(chunk_stmt)
            for old_ch in ch_res.scalars().all():
                await db.delete(old_ch)
            existing.doc_title = parsed["doc_title"]
            existing.version = parsed["version"]
            existing.effective_date = parsed["effective_date"]
            existing.category = parsed["category"]
            existing.status = parsed["status"]
            existing.file_path = str(save_path)
            existing.file_type = file_type
            doc_obj = existing
        else:
            doc_obj = PolicyDocument(
                doc_id=final_doc_id,
                doc_title=parsed["doc_title"],
                version=parsed["version"],
                effective_date=parsed["effective_date"],
                category=parsed["category"],
                status=parsed["status"],
                file_path=str(save_path),
                file_type=file_type
            )
            db.add(doc_obj)

        await db.flush()

        # Add new traceable chunks
        new_chunks_data = []
        for ch in parsed["chunks"]:
            chunk_record = PolicyChunk(
                chunk_id=ch["chunk_id"],
                doc_id=final_doc_id,
                section_id=ch["section_id"],
                heading=ch["heading"],
                content=ch["content"],
                category=ch["category"],
                version=ch["version"],
                status=ch["status"]
            )
            db.add(chunk_record)
            new_chunks_data.append(ch)

        await db.commit()

        # Index in vector store
        vector_store.add_chunks(new_chunks_data)

        return {
            "success": True,
            "message": f"Successfully ingested and indexed policy '{final_doc_id}'.",
            "doc_id": final_doc_id,
            "doc_title": parsed["doc_title"],
            "version": parsed["version"],
            "category": parsed["category"],
            "status": parsed["status"],
            "chunks_created": len(parsed["chunks"]),
            "sections": [c["section_id"] for c in parsed["chunks"]]
        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to process policy document: {str(e)}")

@router.get("")
async def list_policies(
    category: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Lists all active, superseded, and deprecated policy documents in the registry.
    """
    stmt = select(PolicyDocument).order_by(PolicyDocument.doc_id)
    if category:
        stmt = stmt.where(PolicyDocument.category == category)
    if status_filter:
        stmt = stmt.where(PolicyDocument.status == status_filter)

    result = await db.execute(stmt)
    docs = result.scalars().all()

    output = []
    for d in docs:
        chunk_stmt = select(PolicyChunk).where(PolicyChunk.doc_id == d.doc_id)
        chunk_res = await db.execute(chunk_stmt)
        chunks = chunk_res.scalars().all()

        output.append({
            "doc_id": d.doc_id,
            "doc_title": d.doc_title,
            "version": d.version,
            "effective_date": d.effective_date,
            "category": d.category,
            "status": d.status,
            "file_type": d.file_type,
            "chunk_count": len(chunks),
            "uploaded_at": d.uploaded_at.isoformat() if d.uploaded_at else None
        })

    return output

@router.get("/{doc_id}/chunks")
async def get_policy_chunks(
    doc_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves exact chunk and section text from SQLite for the Traceable Policy Citation Drawer.
    """
    stmt = select(PolicyChunk).where(PolicyChunk.doc_id == doc_id).order_by(PolicyChunk.id)
    result = await db.execute(stmt)
    chunks = result.scalars().all()

    if not chunks:
        # Check if doc exists
        doc_stmt = select(PolicyDocument).where(PolicyDocument.doc_id == doc_id)
        doc_res = await db.execute(doc_stmt)
        doc = doc_res.scalars().first()
        if not doc:
            raise HTTPException(status_code=404, detail=f"Policy '{doc_id}' not found.")
        return []

    return [
        {
            "chunk_id": c.chunk_id,
            "doc_id": c.doc_id,
            "section_id": c.section_id,
            "heading": c.heading,
            "content": c.content,
            "category": c.category,
            "version": c.version,
            "status": c.status
        }
        for c in chunks
    ]

@router.patch("/{doc_id}/status")
async def update_policy_status(
    doc_id: str,
    new_status: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Toggles or updates policy status (Active, Superseded, Deprecated).
    """
    if new_status not in ["Active", "Superseded", "Deprecated"]:
        raise HTTPException(status_code=400, detail="Status must be one of: Active, Superseded, Deprecated")

    stmt = select(PolicyDocument).where(PolicyDocument.doc_id == doc_id)
    res = await db.execute(stmt)
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail=f"Policy '{doc_id}' not found.")

    doc.status = new_status

    # Update chunks status
    chunk_stmt = select(PolicyChunk).where(PolicyChunk.doc_id == doc_id)
    ch_res = await db.execute(chunk_stmt)
    for c in ch_res.scalars().all():
        c.status = new_status

    await db.commit()
    return {"success": True, "doc_id": doc_id, "new_status": new_status}

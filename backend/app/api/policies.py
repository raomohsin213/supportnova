import os
import shutil
from pathlib import Path
from typing import Optional, List, Dict, Any
import pydantic
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.config import settings
from app.database import get_db
from app.models.policy import PolicyDocument, PolicyChunk
from app.services.document_parser import DocumentParserService
from app.services.vector_store import vector_store

class PolicyCreatePayload(pydantic.BaseModel):
    doc_id: str
    doc_title: str
    category: str = "General"
    version: str = "v1.0-Active"
    effective_date: str = "2026-01-01"
    status: str = "Active"
    content: str  # Markdown text containing section headings (e.g. "## Section 1.0 ...")

class PolicyUpdatePayload(pydantic.BaseModel):
    doc_title: Optional[str] = None
    category: Optional[str] = None
    version: Optional[str] = None
    effective_date: Optional[str] = None
    status: Optional[str] = None
    content: Optional[str] = None

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

@router.get("/{doc_id}")
async def get_policy_detail(
    doc_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns full details for a single policy document, including raw content and chunks.
    """
    stmt = select(PolicyDocument).where(PolicyDocument.doc_id == doc_id)
    res = await db.execute(stmt)
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail=f"Policy '{doc_id}' not found.")

    chunk_stmt = select(PolicyChunk).where(PolicyChunk.doc_id == doc_id).order_by(PolicyChunk.id)
    ch_res = await db.execute(chunk_stmt)
    chunks = ch_res.scalars().all()

    # Read raw content from file if exists, or generate from chunks
    raw_content = ""
    file_path = Path(doc.file_path) if doc.file_path else None
    if file_path and file_path.exists():
        try:
            raw_content = file_path.read_text(encoding="utf-8")
        except Exception:
            pass
    if not raw_content:
        fallback_path = Path("data/policies") / f"{doc.doc_id}.md"
        if fallback_path.exists():
            try:
                raw_content = fallback_path.read_text(encoding="utf-8")
            except Exception:
                pass
    if not raw_content and chunks:
        sections_text = "\n\n".join([f"## {c.heading or c.section_id}\n{c.content}" for c in chunks])
        raw_content = f"# {doc.doc_title}\n**Document ID:** {doc.doc_id} | **Version:** {doc.version} | **Status:** {doc.status}\n**Category:** {doc.category} | **Effective Date:** {doc.effective_date}\n\n---\n\n{sections_text}"

    return {
        "doc_id": doc.doc_id,
        "doc_title": doc.doc_title,
        "version": doc.version,
        "effective_date": doc.effective_date,
        "category": doc.category,
        "status": doc.status,
        "file_type": doc.file_type,
        "file_path": doc.file_path,
        "uploaded_at": doc.uploaded_at.isoformat() if doc.uploaded_at else None,
        "content": raw_content,
        "chunks": [
            {
                "chunk_id": c.chunk_id,
                "section_id": c.section_id,
                "heading": c.heading,
                "content": c.content,
                "category": c.category,
                "version": c.version,
                "status": c.status
            }
            for c in chunks
        ]
    }

@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_policy(
    payload: PolicyCreatePayload,
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a new corporate policy document directly from form/text input.
    Generates markdown file in data/policies/, parses logical sections,
    inserts into SQLite and Vector Store, and syncs to MongoDB Atlas.
    """
    doc_id = payload.doc_id.strip().upper()
    if not doc_id:
        raise HTTPException(status_code=400, detail="Document ID is required.")

    # Check if doc_id already exists
    stmt = select(PolicyDocument).where(PolicyDocument.doc_id == doc_id)
    res = await db.execute(stmt)
    if res.scalars().first():
        raise HTTPException(status_code=400, detail=f"Policy '{doc_id}' already exists. Use edit instead.")

    # Save to data/policies/{doc_id}.md and UPLOAD_DIR
    policies_dir = Path("data/policies")
    policies_dir.mkdir(parents=True, exist_ok=True)
    file_path = policies_dir / f"{doc_id}.md"

    # Format markdown header if not already present
    content = payload.content.strip()
    if not content.startswith("#"):
        content = (
            f"# {payload.doc_title}\n"
            f"**Document ID:** {doc_id} | **Version:** {payload.version} | **Status:** {payload.status}\n"
            f"**Category:** {payload.category} | **Effective Date:** {payload.effective_date}\n\n"
            f"---\n\n"
            f"{content}"
        )

    file_path.write_text(content, encoding="utf-8")

    # Also save copy in UPLOAD_DIR
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    upload_copy = settings.UPLOAD_DIR / f"{doc_id}.md"
    upload_copy.write_text(content, encoding="utf-8")

    # Parse logical sections
    parsed = DocumentParserService.extract_metadata_and_chunks(
        text=content,
        default_doc_id=doc_id,
        default_title=payload.doc_title,
        default_version=payload.version,
        default_effective_date=payload.effective_date,
        default_category=payload.category,
        default_status=payload.status
    )

    doc_obj = PolicyDocument(
        doc_id=doc_id,
        doc_title=payload.doc_title,
        version=payload.version,
        effective_date=payload.effective_date,
        category=payload.category,
        status=payload.status,
        file_path=str(file_path),
        file_type="text"
    )
    db.add(doc_obj)
    await db.flush()

    new_chunks_data = []
    for ch in parsed["chunks"]:
        chunk_record = PolicyChunk(
            chunk_id=ch["chunk_id"],
            doc_id=doc_id,
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

    # Index into vector store
    vector_store.add_chunks(new_chunks_data)

    # Sync to MongoDB Atlas
    try:
        from app.mongodb import sync_policy_to_mongo
        await sync_policy_to_mongo({
            "doc_id": doc_id,
            "doc_title": payload.doc_title,
            "version": payload.version,
            "effective_date": payload.effective_date,
            "category": payload.category,
            "status": payload.status,
            "file_type": "text",
            "file_path": str(file_path),
            "chunk_count": len(new_chunks_data)
        }, new_chunks_data)
    except Exception:
        pass

    return {
        "success": True,
        "message": f"Successfully created and indexed policy '{doc_id}'.",
        "doc_id": doc_id,
        "doc_title": payload.doc_title,
        "chunks_created": len(new_chunks_data)
    }

@router.put("/{doc_id}")
async def update_policy(
    doc_id: str,
    payload: PolicyUpdatePayload,
    db: AsyncSession = Depends(get_db)
):
    """
    Updates policy metadata and/or content sections.
    If content is updated, re-chunks and re-indexes in vector store and MongoDB Atlas.
    """
    stmt = select(PolicyDocument).where(PolicyDocument.doc_id == doc_id)
    res = await db.execute(stmt)
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail=f"Policy '{doc_id}' not found.")

    if payload.doc_title is not None:
        doc.doc_title = payload.doc_title.strip()
    if payload.category is not None:
        doc.category = payload.category.strip()
    if payload.version is not None:
        doc.version = payload.version.strip()
    if payload.effective_date is not None:
        doc.effective_date = payload.effective_date.strip()
    if payload.status is not None:
        doc.status = payload.status.strip()

    new_chunks_data = []

    # If new content provided, re-chunk and re-index
    if payload.content is not None and payload.content.strip():
        content = payload.content.strip()
        file_path = Path(doc.file_path) if doc.file_path else Path("data/policies") / f"{doc_id}.md"
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text(content, encoding="utf-8")
        doc.file_path = str(file_path)

        # Delete old chunks
        chunk_stmt = select(PolicyChunk).where(PolicyChunk.doc_id == doc_id)
        ch_res = await db.execute(chunk_stmt)
        for old_ch in ch_res.scalars().all():
            await db.delete(old_ch)

        # Extract new chunks
        parsed = DocumentParserService.extract_metadata_and_chunks(
            text=content,
            default_doc_id=doc_id,
            default_title=doc.doc_title,
            default_version=doc.version,
            default_effective_date=doc.effective_date,
            default_category=doc.category,
            default_status=doc.status
        )

        for ch in parsed["chunks"]:
            chunk_record = PolicyChunk(
                chunk_id=ch["chunk_id"],
                doc_id=doc_id,
                section_id=ch["section_id"],
                heading=ch["heading"],
                content=ch["content"],
                category=doc.category,
                version=doc.version,
                status=doc.status
            )
            db.add(chunk_record)
            new_chunks_data.append(ch)

        # Re-index in vector store
        vector_store.remove_doc(doc_id)
        vector_store.add_chunks(new_chunks_data)
    else:
        # Update existing chunks metadata if content didn't change
        chunk_stmt = select(PolicyChunk).where(PolicyChunk.doc_id == doc_id)
        ch_res = await db.execute(chunk_stmt)
        for c in ch_res.scalars().all():
            if payload.category is not None:
                c.category = doc.category
            if payload.version is not None:
                c.version = doc.version
            if payload.status is not None:
                c.status = doc.status
            new_chunks_data.append({
                "chunk_id": c.chunk_id,
                "doc_id": c.doc_id,
                "section_id": c.section_id,
                "heading": c.heading,
                "content": c.content,
                "category": c.category,
                "version": c.version,
                "status": c.status
            })

    await db.commit()

    # Sync updated policy to MongoDB Atlas
    try:
        from app.mongodb import sync_policy_to_mongo
        await sync_policy_to_mongo({
            "doc_id": doc_id,
            "doc_title": doc.doc_title,
            "version": doc.version,
            "effective_date": doc.effective_date,
            "category": doc.category,
            "status": doc.status,
            "file_type": doc.file_type or "text",
            "file_path": doc.file_path,
            "chunk_count": len(new_chunks_data)
        }, new_chunks_data)
    except Exception:
        pass

    return {
        "success": True,
        "message": f"Policy '{doc_id}' updated successfully.",
        "doc_id": doc_id,
        "doc_title": doc.doc_title,
        "chunks_count": len(new_chunks_data)
    }

@router.delete("/{doc_id}")
async def delete_policy(
    doc_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Permanently deletes a policy document and all its traceable chunks
    from SQLite, the Vector Store, MongoDB Atlas, and disk.
    """
    stmt = select(PolicyDocument).where(PolicyDocument.doc_id == doc_id)
    res = await db.execute(stmt)
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail=f"Policy '{doc_id}' not found.")

    # Delete all associated chunks from SQLite
    chunk_stmt = select(PolicyChunk).where(PolicyChunk.doc_id == doc_id)
    ch_res = await db.execute(chunk_stmt)
    chunks_deleted = 0
    for c in ch_res.scalars().all():
        await db.delete(c)
        chunks_deleted += 1

    # Delete policy document from SQLite
    await db.delete(doc)
    await db.commit()

    # Remove from Vector Store
    vector_store.remove_doc(doc_id)

    # Delete from MongoDB Atlas
    try:
        from app.mongodb import delete_policy_from_mongo
        await delete_policy_from_mongo(doc_id)
    except Exception:
        pass

    # Delete file from disk if present
    for path_candidate in [Path(doc.file_path) if doc.file_path else None, Path("data/policies") / f"{doc_id}.md", settings.UPLOAD_DIR / f"{doc_id}.md"]:
        if path_candidate and path_candidate.exists():
            try:
                path_candidate.unlink()
            except Exception:
                pass

    return {
        "success": True,
        "message": f"Policy '{doc_id}' and {chunks_deleted} associated chunks deleted successfully.",
        "doc_id": doc_id,
        "chunks_deleted": chunks_deleted
    }

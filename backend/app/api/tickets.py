import json
import uuid
from datetime import datetime
from typing import Optional, Literal
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.ticket import ComplaintTicket
from app.models.audit import AuditLog

router = APIRouter(prefix="/tickets", tags=["Tickets & Diff Inspector"])

class TicketActionPayload(BaseModel):
    action: str = Field(..., description="Governance action to execute")
    notes: Optional[str] = Field(None, description="Human reviewer justification notes")
    override_priority: Optional[str] = None
    override_department: Optional[str] = None
    override_response: Optional[str] = None

@router.get("")
async def list_tickets(
    status_filter: Optional[str] = Query(None, description="Filter by ticket status"),
    priority_filter: Optional[str] = Query(None, description="Filter by priority"),
    department_filter: Optional[str] = Query(None, description="Filter by department"),
    only_blocked: Optional[bool] = Query(None, description="Filter by dispatch blocked"),
    search: Optional[str] = Query(None, description="Search by customer, title, or order reference"),
    limit: int = Query(500, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns list of complaint tickets with filtering for Agent Workspace and Review Queue.
    """
    stmt = select(ComplaintTicket).order_by(desc(ComplaintTicket.created_at))

    if status_filter:
        stmt = stmt.where(ComplaintTicket.status == status_filter)
    if priority_filter:
        stmt = stmt.where(ComplaintTicket.final_priority == priority_filter)
    if department_filter:
        stmt = stmt.where(ComplaintTicket.assigned_department == department_filter)
    if only_blocked is not None:
        stmt = stmt.where(ComplaintTicket.is_automated_dispatch_blocked == only_blocked)

    result = await db.execute(stmt)
    tickets = result.scalars().all()

    if search:
        s_lower = search.lower()
        tickets = [
            t for t in tickets
            if s_lower in t.customer_name.lower()
            or s_lower in t.complaint_title.lower()
            or s_lower in t.complaint_id.lower()
            or (t.order_reference and s_lower in t.order_reference.lower())
        ]

    total = len(tickets)
    paginated = tickets[offset : offset + limit]

    data = []
    for t in paginated:
        data.append({
            "complaint_id": t.complaint_id,
            "customer_name": t.customer_name,
            "customer_tier": t.customer_tier,
            "channel": t.channel,
            "complaint_title": t.complaint_title,
            "primary_issue": t.primary_issue or t.complaint_title,
            "secondary_issue": t.secondary_issue,
            "product_or_service": t.product_or_service,
            "order_reference": t.order_reference,
            "transaction_date": t.transaction_date,
            "status": t.status,
            "assigned_department": t.assigned_department,
            "primary_department": t.primary_department or t.assigned_department,
            "supporting_departments": t.supporting_departments,
            "product_or_service": t.product_or_service,
            "product_image_url": t.product_image_url,
            "evidence_image_url": t.evidence_image_url,
            "customer_email": t.customer_email,
            "order_reference": t.order_reference,
            "final_priority": t.final_priority,
            "final_urgency": t.final_urgency,
            "final_sentiment": t.final_sentiment,
            "escalation_level": t.escalation_level,
            "is_duplicate": t.is_duplicate,
            "duplicate_of_id": t.duplicate_of_id,
            "is_repeat_complaint": t.is_repeat_complaint,
            "repeat_count": t.repeat_count,
            "is_automated_dispatch_blocked": t.is_automated_dispatch_blocked,
            "coverage_score": t.coverage_score,
            "traceability_score": t.traceability_score,
            "routing_score": t.routing_score,
            "overall_confidence_score": t.overall_confidence_score,
            "human_reviewer_action": t.human_reviewer_action,
            "human_reviewer_notes": t.human_reviewer_notes,
            "conversation_history": t.conversation_history,
            "created_at": t.created_at.isoformat() if t.created_at else None
        })

    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "tickets": data
    }

@router.get("/{complaint_id}")
async def get_ticket_detail(
    complaint_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns full ticket inspection details: raw payload, Pipeline 1 output,
    Pipeline 2 output, field-by-field diff breakdown, audit logs, and conversation history.
    """
    stmt = select(ComplaintTicket).where(ComplaintTicket.complaint_id == complaint_id)
    result = await db.execute(stmt)
    ticket = result.scalars().first()

    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket '{complaint_id}' not found.")

    # Fetch audit logs
    audit_stmt = select(AuditLog).where(AuditLog.ticket_id == complaint_id).order_by(desc(AuditLog.timestamp))
    audit_res = await db.execute(audit_stmt)
    audit_logs = audit_res.scalars().all()

    # Build fallback thread if empty
    conv = ticket.conversation_history
    if not conv:
        conv = [
            {
                "id": f"msg-init-{ticket.complaint_id}",
                "sender": "customer",
                "sender_name": ticket.customer_name or "Customer",
                "message": ticket.complaint_description,
                "timestamp": ticket.created_at.strftime("%Y-%m-%d %H:%M UTC") if ticket.created_at else "Just now",
                "action": "complaint_submitted"
            }
        ]
        if ticket.official_resolution_message:
            conv.append({
                "id": f"msg-agent-{ticket.complaint_id}",
                "sender": "agent",
                "sender_name": "Support Specialist",
                "message": ticket.official_resolution_message,
                "timestamp": ticket.updated_at.strftime("%Y-%m-%d %H:%M UTC") if ticket.updated_at else "Just now",
                "action": "specialist_response"
            })

    return {
        "complaint_id": ticket.complaint_id,
        "customer_name": ticket.customer_name,
        "customer_tier": ticket.customer_tier,
        "customer_email": ticket.customer_email,
        "channel": ticket.channel,
        "complaint_title": ticket.complaint_title,
        "complaint_description": ticket.complaint_description,
        "primary_issue": ticket.primary_issue or ticket.complaint_title,
        "secondary_issue": ticket.secondary_issue,
        "product_or_service": ticket.product_or_service,
        "product_image_url": ticket.product_image_url,
        "evidence_image_url": ticket.evidence_image_url,
        "order_reference": ticket.order_reference,
        "transaction_date": ticket.transaction_date,
        "previous_complaints_count": ticket.previous_complaints_count,
        "status": ticket.status,
        "assigned_department": ticket.assigned_department,
        "primary_department": ticket.primary_department or ticket.assigned_department,
        "supporting_departments": ticket.supporting_departments,
        "final_priority": ticket.final_priority,
        "final_urgency": ticket.final_urgency,
        "final_sentiment": ticket.final_sentiment,
        "escalation_level": ticket.escalation_level,
        "is_duplicate": ticket.is_duplicate,
        "duplicate_of_id": ticket.duplicate_of_id,
        "is_repeat_complaint": ticket.is_repeat_complaint,
        "repeat_count": ticket.repeat_count,
        "extracted_entities": ticket.extracted_entities,
        "clarification_questions": ticket.clarification_questions,
        "follow_up_message": ticket.follow_up_message,
        "is_automated_dispatch_blocked": ticket.is_automated_dispatch_blocked,
        "coverage_score": ticket.coverage_score,
        "traceability_score": ticket.traceability_score,
        "routing_score": ticket.routing_score,
        "overall_confidence_score": ticket.overall_confidence_score,
        "human_reviewer_action": ticket.human_reviewer_action,
        "human_reviewer_notes": ticket.human_reviewer_notes,
        "official_resolution_message": ticket.official_resolution_message,
        "conversation_history": conv,
        "pipeline_1_genai": ticket.genai_output,
        "pipeline_2_ground_truth": ticket.validation_output,
        "diff_summary": ticket.diff_summary,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
        "updated_at": ticket.updated_at.isoformat() if ticket.updated_at else None,
        "audit_logs": [
            {
                "id": a.id,
                "actor": a.actor,
                "action": a.action,
                "rationale": a.rationale,
                "timestamp": a.timestamp.isoformat() if a.timestamp else None
            }
            for a in audit_logs
        ]
    }

class CustomerReplyPayload(BaseModel):
    message: str
    customer_email: Optional[str] = None
    evidence_image_url: Optional[str] = None

class CustomerClosePayload(BaseModel):
    satisfaction_notes: Optional[str] = None

@router.post("/{complaint_id}/action")
async def take_ticket_action(
    complaint_id: str,
    payload: TicketActionPayload,
    db: AsyncSession = Depends(get_db)
):
    """
    Executes governance actions:
    1. 'Approve & Send Response' -> Unblocks dispatch, updates status to Verified, sends official agent/AI response
    2. 'Override Classification' -> Applies human supervisor priority/dept overrides
    3. 'Escalate to Admin' -> Escalates ticket with reason note for Executive Admin
    4. 'Close Ticket' -> Marks ticket as Resolved & Closed
    """
    stmt = select(ComplaintTicket).where(ComplaintTicket.complaint_id == complaint_id)
    result = await db.execute(stmt)
    ticket = result.scalars().first()

    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket '{complaint_id}' not found.")

    prev_status = ticket.status
    prev_action = ticket.human_reviewer_action
    conv = ticket.conversation_history

    if payload.action in ["Approve & Send Response", "Approve & Dispatch", "Approve & Send"]:
        ticket.is_automated_dispatch_blocked = False
        ticket.status = "Verified"
        ticket.human_reviewer_action = "Approved"
        ticket.human_reviewer_notes = payload.notes or "Manually verified and approved by Support Specialist."
        genai = ticket.genai_output or {}
        if payload.override_response and payload.override_response.strip():
            ticket.official_resolution_message = payload.override_response.strip()
        else:
            base_resp = genai.get("professional_response") or "Thank you for contacting SupportNova. We have reviewed your complaint and approved warranty coverage."
            ticket.official_resolution_message = f"{base_resp}\n\n[Specialist Resolution]: {ticket.human_reviewer_notes}"

        conv.append({
            "id": f"msg-agent-{uuid.uuid4().hex[:6]}",
            "sender": "agent",
            "sender_name": "Support Specialist",
            "message": ticket.official_resolution_message,
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
            "action": "specialist_response"
        })
        ticket.conversation_history = conv
        
    elif payload.action == "Override Classification":
        if payload.override_priority:
            ticket.final_priority = payload.override_priority
        if payload.override_department:
            ticket.assigned_department = payload.override_department
        ticket.status = "Verified with Warning"
        ticket.human_reviewer_action = "Overridden"
        ticket.is_automated_dispatch_blocked = False
        ticket.human_reviewer_notes = payload.notes or "Classification overridden by agent supervisor."
        genai = ticket.genai_output or {}
        if payload.override_response and payload.override_response.strip():
            ticket.official_resolution_message = payload.override_response.strip()
        else:
            base_resp = genai.get("professional_response") or "Thank you for contacting SupportNova. Classification updated."
            ticket.official_resolution_message = f"{base_resp}\n\n[Supervisor Note]: {ticket.human_reviewer_notes}"

        conv.append({
            "id": f"msg-override-{uuid.uuid4().hex[:6]}",
            "sender": "agent",
            "sender_name": "Supervisor Override",
            "message": ticket.official_resolution_message,
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
            "action": "supervisor_override"
        })
        ticket.conversation_history = conv

    elif payload.action in ["Escalate to Admin", "Escalate to Tier 2 Manager"]:
        ticket.final_priority = "P1"
        ticket.status = "Escalated to Admin"
        ticket.escalation_level = "Tier 6: Executive Incident Board"
        ticket.is_automated_dispatch_blocked = True
        ticket.human_reviewer_action = "Escalated to Admin"
        ticket.human_reviewer_notes = payload.notes or "Escalated to System Admin for executive policy authorization."
        ticket.official_resolution_message = f"Your case has been escalated to Tier 6 Executive Administration for formal policy review.\n\n[Escalation Reason]: {ticket.human_reviewer_notes}"

        conv.append({
            "id": f"msg-escalate-{uuid.uuid4().hex[:6]}",
            "sender": "system",
            "sender_name": "Governance Escalation",
            "message": ticket.official_resolution_message,
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
            "action": "admin_escalation"
        })
        ticket.conversation_history = conv

    elif payload.action in ["Admin Authorize & Dispatch", "Admin Override & Approve"]:
        ticket.status = "Verified"
        ticket.escalation_level = "Resolved by Admin"
        ticket.human_reviewer_action = "Admin Approved"
        ticket.is_automated_dispatch_blocked = False
        ticket.human_reviewer_notes = payload.notes or "Executive authorization granted by System Admin."
        genai = ticket.genai_output or {}
        if payload.override_response and payload.override_response.strip():
            ticket.official_resolution_message = payload.override_response.strip()
        else:
            base_resp = genai.get("professional_response") or "Executive authorization confirmed."
            ticket.official_resolution_message = f"{base_resp}\n\n[Executive Admin Authorization]: {ticket.human_reviewer_notes}"

        conv.append({
            "id": f"msg-admin-{uuid.uuid4().hex[:6]}",
            "sender": "admin",
            "sender_name": "System Administrator",
            "message": ticket.official_resolution_message,
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
            "action": "admin_authorization"
        })
        ticket.conversation_history = conv

    elif payload.action in ["Agent Reply", "Reply to Customer"]:
        # Freeform agent reply — does NOT change ticket to Verified/Approved.
        # Simply adds the agent's message to conversation thread and marks
        # ticket as "Awaiting Customer" so the customer knows they need to respond.
        reply_msg = payload.override_response or payload.notes or ""
        if not reply_msg.strip():
            raise HTTPException(status_code=400, detail="Reply message cannot be empty.")
        ticket.status = "Awaiting Customer"
        ticket.human_reviewer_action = "Replied"
        ticket.human_reviewer_notes = payload.notes or "Agent sent a follow-up reply to the customer."
        ticket.official_resolution_message = reply_msg.strip()

        conv.append({
            "id": f"msg-reply-{uuid.uuid4().hex[:6]}",
            "sender": "agent",
            "sender_name": "Support Specialist",
            "message": reply_msg.strip(),
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
            "action": "agent_reply"
        })
        ticket.conversation_history = conv

    elif payload.action in ["Close Ticket", "Resolve & Close Ticket", "Approve & Close"]:
        ticket.status = "Resolved & Closed"
        ticket.is_automated_dispatch_blocked = False
        ticket.human_reviewer_action = "Closed"
        ticket.human_reviewer_notes = payload.notes or "Ticket officially resolved and closed by Support Specialist."
        
        conv.append({
            "id": f"msg-close-{uuid.uuid4().hex[:6]}",
            "sender": "agent",
            "sender_name": "Support Specialist",
            "message": payload.notes or "This ticket has been officially marked as Resolved & Closed by Support Specialist.",
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
            "action": "ticket_closed"
        })
        ticket.conversation_history = conv

    ticket.updated_at = datetime.utcnow()

    # Record audit log
    audit = AuditLog(
        ticket_id=complaint_id,
        actor="Support Agent (Diff Inspector)",
        action=payload.action,
        previous_state=f"Status: {prev_status}, Action: {prev_action}",
        new_state=f"Status: {ticket.status}, Action: {ticket.human_reviewer_action}",
        rationale=payload.notes
    )
    db.add(audit)
    await db.commit()

    # Sync live ticket document to MongoDB Atlas
    try:
        from app.mongodb import sync_ticket_to_mongo
        await sync_ticket_to_mongo(ticket.to_mongo_dict())
    except Exception:
        pass

    return {
        "success": True,
        "complaint_id": complaint_id,
        "action": payload.action,
        "new_status": ticket.status,
        "is_automated_dispatch_blocked": ticket.is_automated_dispatch_blocked,
        "notes": ticket.human_reviewer_notes,
        "conversation_history": ticket.conversation_history
    }

@router.post("/{complaint_id}/customer-reply")
async def customer_reply_ticket(
    complaint_id: str,
    payload: CustomerReplyPayload,
    db: AsyncSession = Depends(get_db)
):
    """
    Allows a customer to reply to a support response.
    Appends to the conversation thread, reopens the ticket, and alerts the Specialist workspace.
    Optionally accepts an attached photo / evidence image url.
    """
    stmt = select(ComplaintTicket).where(ComplaintTicket.complaint_id == complaint_id)
    result = await db.execute(stmt)
    ticket = result.scalars().first()

    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket '{complaint_id}' not found.")

    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Reply message cannot be empty.")

    prev_status = ticket.status
    ticket.status = "Reopened"
    ticket.human_reviewer_action = "Customer Replied - Review Required"
    ticket.is_automated_dispatch_blocked = True
    ticket.updated_at = datetime.utcnow()

    # If customer attached a photo in reply, update ticket's evidence image
    if payload.evidence_image_url and payload.evidence_image_url.strip():
        ticket.evidence_image_url = payload.evidence_image_url.strip()

    conv = ticket.conversation_history
    msg_obj = {
        "id": f"msg-cust-{uuid.uuid4().hex[:6]}",
        "sender": "customer",
        "sender_name": ticket.customer_name or "Customer",
        "message": payload.message.strip(),
        "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
        "action": "customer_reply"
    }
    if payload.evidence_image_url and payload.evidence_image_url.strip():
        msg_obj["image_url"] = payload.evidence_image_url.strip()
        msg_obj["has_attachment"] = True

    conv.append(msg_obj)
    ticket.conversation_history = conv

    audit = AuditLog(
        ticket_id=complaint_id,
        actor=f"Customer ({ticket.customer_name})",
        action="Customer Reply (Reopen Ticket)",
        previous_state=prev_status,
        new_state="Reopened",
        rationale=payload.message.strip()
    )
    db.add(audit)
    await db.commit()

    # Sync live updated ticket to MongoDB Atlas
    try:
        from app.mongodb import sync_ticket_to_mongo
        await sync_ticket_to_mongo(ticket.to_mongo_dict())
    except Exception:
        pass

    return ticket.to_customer_dict()

@router.post("/{complaint_id}/customer-close")
async def customer_close_ticket(
    complaint_id: str,
    payload: CustomerClosePayload,
    db: AsyncSession = Depends(get_db)
):
    """
    Allows the customer to agree to the proposed resolution and close the ticket with mutual satisfaction.
    """
    stmt = select(ComplaintTicket).where(ComplaintTicket.complaint_id == complaint_id)
    result = await db.execute(stmt)
    ticket = result.scalars().first()

    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket '{complaint_id}' not found.")

    prev_status = ticket.status
    ticket.status = "Resolved & Closed"
    ticket.is_automated_dispatch_blocked = False
    ticket.human_reviewer_action = "Resolved by Customer Agreement"
    ticket.updated_at = datetime.utcnow()

    note = payload.satisfaction_notes.strip() if (payload.satisfaction_notes and payload.satisfaction_notes.strip()) else "Customer accepted resolution and approved closure."
    conv = ticket.conversation_history
    conv.append({
        "id": f"msg-close-{uuid.uuid4().hex[:6]}",
        "sender": "customer",
        "sender_name": ticket.customer_name or "Customer",
        "message": f"Resolution Accepted: {note}",
        "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
        "action": "customer_accepted_close"
    })
    ticket.conversation_history = conv

    audit = AuditLog(
        ticket_id=complaint_id,
        actor=f"Customer ({ticket.customer_name})",
        action="Customer Approved & Closed",
        previous_state=prev_status,
        new_state="Resolved & Closed",
        rationale=note
    )
    db.add(audit)
    await db.commit()

    # Sync live closed ticket to MongoDB Atlas
    try:
        from app.mongodb import sync_ticket_to_mongo
        await sync_ticket_to_mongo(ticket.to_mongo_dict())
    except Exception:
        pass

    return ticket.to_customer_dict()

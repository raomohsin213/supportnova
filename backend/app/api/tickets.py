import json
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
    action: Literal["Approve & Send Response", "Override Classification", "Escalate to Tier 2 Manager"]
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
    limit: int = Query(50, ge=1, le=100),
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
            "order_reference": t.order_reference,
            "transaction_date": t.transaction_date,
            "status": t.status,
            "assigned_department": t.assigned_department,
            "final_priority": t.final_priority,
            "final_urgency": t.final_urgency,
            "final_sentiment": t.final_sentiment,
            "is_automated_dispatch_blocked": t.is_automated_dispatch_blocked,
            "coverage_score": t.coverage_score,
            "traceability_score": t.traceability_score,
            "routing_score": t.routing_score,
            "overall_confidence_score": t.overall_confidence_score,
            "human_reviewer_action": t.human_reviewer_action,
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
    Pipeline 2 output, field-by-field diff breakdown, and audit logs.
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

    return {
        "complaint_id": ticket.complaint_id,
        "customer_name": ticket.customer_name,
        "customer_tier": ticket.customer_tier,
        "channel": ticket.channel,
        "complaint_title": ticket.complaint_title,
        "complaint_description": ticket.complaint_description,
        "order_reference": ticket.order_reference,
        "transaction_date": ticket.transaction_date,
        "previous_complaints_count": ticket.previous_complaints_count,
        "status": ticket.status,
        "assigned_department": ticket.assigned_department,
        "final_priority": ticket.final_priority,
        "final_urgency": ticket.final_urgency,
        "final_sentiment": ticket.final_sentiment,
        "is_automated_dispatch_blocked": ticket.is_automated_dispatch_blocked,
        "coverage_score": ticket.coverage_score,
        "traceability_score": ticket.traceability_score,
        "routing_score": ticket.routing_score,
        "overall_confidence_score": ticket.overall_confidence_score,
        "human_reviewer_action": ticket.human_reviewer_action,
        "human_reviewer_notes": ticket.human_reviewer_notes,
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

@router.post("/{complaint_id}/action")
async def take_ticket_action(
    complaint_id: str,
    payload: TicketActionPayload,
    db: AsyncSession = Depends(get_db)
):
    """
    Executes governance actions:
    1. 'Approve & Send Response' -> Unblocks dispatch, updates status to Verified
    2. 'Override Classification' -> Applies human supervisor overrides
    3. 'Escalate to Tier 2 Manager' -> Escalates ticket with P1 SLA
    """
    stmt = select(ComplaintTicket).where(ComplaintTicket.complaint_id == complaint_id)
    result = await db.execute(stmt)
    ticket = result.scalars().first()

    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket '{complaint_id}' not found.")

    prev_status = ticket.status
    prev_action = ticket.human_reviewer_action

    if payload.action == "Approve & Send Response":
        ticket.is_automated_dispatch_blocked = False
        ticket.status = "Verified"
        ticket.human_reviewer_action = "Approved"
        ticket.human_reviewer_notes = payload.notes or "Manually verified and approved by Support Supervisor."
        
    elif payload.action == "Override Classification":
        if payload.override_priority:
            ticket.final_priority = payload.override_priority
        if payload.override_department:
            ticket.assigned_department = payload.override_department
        ticket.status = "Verified with Warning"
        ticket.human_reviewer_action = "Overridden"
        ticket.is_automated_dispatch_blocked = False
        ticket.human_reviewer_notes = payload.notes or "Classification overridden by agent supervisor."

    elif payload.action == "Escalate to Tier 2 Manager":
        ticket.final_priority = "P1"
        ticket.status = "Manual Review Required"
        ticket.is_automated_dispatch_blocked = True
        ticket.human_reviewer_action = "Escalated"
        ticket.human_reviewer_notes = payload.notes or "Escalated to Tier 2 Executive Operations Manager."

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

    return {
        "success": True,
        "complaint_id": complaint_id,
        "action": payload.action,
        "new_status": ticket.status,
        "is_automated_dispatch_blocked": ticket.is_automated_dispatch_blocked,
        "notes": ticket.human_reviewer_notes
    }

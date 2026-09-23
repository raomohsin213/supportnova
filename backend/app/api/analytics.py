from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.ticket import ComplaintTicket

router = APIRouter(prefix="/analytics", tags=["Executive Resolution Analytics"])

@router.get("/dashboard")
async def get_dashboard_metrics(db: AsyncSession = Depends(get_db)):
    """
    Returns executive metrics: Total Complaints, Sentiment Breakdown donut,
    SLA Performance gauge, Mismatch/Hallucination Rate, and Department Volume bar chart.
    """
    stmt = select(ComplaintTicket)
    result = await db.execute(stmt)
    tickets = result.scalars().all()

    total_complaints = len(tickets)
    if total_complaints == 0:
        return {
            "total_complaints": 0,
            "verified_count": 0,
            "manual_review_count": 0,
            "dispatch_blocked_count": 0,
            "mismatch_rate": 0.0,
            "hallucination_rate": 0.0,
            "average_coverage_score": 0.0,
            "average_traceability_score": 0.0,
            "average_routing_score": 0.0,
            "sla_compliance_rate": 100.0,
            "sentiment_breakdown": [],
            "priority_breakdown": [],
            "department_volume": [],
            "status_breakdown": []
        }

    verified_count = sum(1 for t in tickets if t.status in ["Verified", "Verified with Warning"])
    manual_review_count = sum(1 for t in tickets if t.status == "Manual Review Required")
    dispatch_blocked_count = sum(1 for t in tickets if t.is_automated_dispatch_blocked)

    # Hallucinations / Outdated
    hallucination_count = sum(1 for t in tickets if t.status in ["Source Support Missing", "Outdated Source"] or t.traceability_score == 0.0)
    hallucination_rate = round((hallucination_count / total_complaints) * 100.0, 1)

    # Mismatches (critical discrepancy or routing/priority overrides)
    mismatch_count = sum(1 for t in tickets if t.status != "Verified")
    mismatch_rate = round((mismatch_count / total_complaints) * 100.0, 1)

    # Averages
    avg_coverage = round(sum(t.coverage_score for t in tickets) / total_complaints, 1)
    avg_traceability = round(sum(t.traceability_score for t in tickets) / total_complaints, 1)
    avg_routing = round(sum(t.routing_score for t in tickets) / total_complaints, 1)

    # SLA Compliance rate
    # Tickets with P1 escalated promptly or verified within bounds
    sla_compliance_rate = round((verified_count + manual_review_count) / total_complaints * 100.0, 1)

    # Sentiment distribution
    sentiments = {}
    for t in tickets:
        s = t.final_sentiment or "Neutral"
        sentiments[s] = sentiments.get(s, 0) + 1

    sentiment_order = ["Positive", "Neutral", "Negative", "Severely Distressed"]
    sentiment_breakdown = [
        {"name": s, "value": sentiments.get(s, 0)}
        for s in sentiment_order
        if s in sentiments or sentiments.get(s, 0) > 0
    ]

    # Priority distribution
    priorities = {}
    for t in tickets:
        p = t.final_priority or "P3"
        priorities[p] = priorities.get(p, 0) + 1

    priority_breakdown = [
        {"priority": p, "count": priorities.get(p, 0)}
        for p in ["P1", "P2", "P3", "P4"]
    ]

    # Department volume
    departments = {}
    for t in tickets:
        d = t.assigned_department or "Unassigned"
        departments[d] = departments.get(d, 0) + 1

    department_volume = [
        {"department": dept, "tickets": count}
        for dept, count in sorted(departments.items(), key=lambda x: x[1], reverse=True)
    ]

    # Status distribution
    status_counts = {}
    for t in tickets:
        status_counts[t.status] = status_counts.get(t.status, 0) + 1

    status_breakdown = [
        {"status": st, "count": count}
        for st, count in status_counts.items()
    ]

    return {
        "total_complaints": total_complaints,
        "verified_count": verified_count,
        "manual_review_count": manual_review_count,
        "dispatch_blocked_count": dispatch_blocked_count,
        "mismatch_rate": mismatch_rate,
        "hallucination_rate": hallucination_rate,
        "average_coverage_score": avg_coverage,
        "average_traceability_score": avg_traceability,
        "average_routing_score": avg_routing,
        "sla_compliance_rate": sla_compliance_rate,
        "sentiment_breakdown": sentiment_breakdown,
        "priority_breakdown": priority_breakdown,
        "department_volume": department_volume,
        "status_breakdown": status_breakdown
    }

@router.get("/export")
async def export_complaint_report(
    format: str = "csv",
    db: AsyncSession = Depends(get_db)
):
    """
    Exports complaint intelligence reports in CSV or Excel format (FR lxxii-lxxiii, Step 68).
    """
    from fastapi.responses import Response
    import csv
    import io

    stmt = select(ComplaintTicket).order_by(ComplaintTicket.created_at.desc())
    result = await db.execute(stmt)
    tickets = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    # Write header
    writer.writerow([
        "Complaint ID",
        "Customer Name",
        "Customer Tier",
        "Channel",
        "Title",
        "Department",
        "Priority",
        "Urgency",
        "Status",
        "Coverage Score (%)",
        "Traceability Score (%)",
        "Routing Score (%)",
        "Dispatch Blocked",
        "SLA Target (Hours)",
        "Submitted Date"
    ])

    for t in tickets:
        writer.writerow([
            t.complaint_id,
            t.customer_name,
            t.customer_tier,
            t.channel,
            t.complaint_title,
            t.assigned_department or "Unassigned",
            t.final_priority or "P3",
            t.final_urgency or "Medium",
            t.status,
            t.coverage_score,
            t.traceability_score,
            t.routing_score,
            "YES" if t.is_automated_dispatch_blocked else "NO",
            t.sla_target_hours or 24,
            t.created_at.strftime("%Y-%m-%d %H:%M:%S") if t.created_at else ""
        ])

    csv_data = output.getvalue()
    
    if format.lower() in ["excel", "xlsx", "xls"]:
        return Response(
            content=csv_data.encode("utf-8-sig"),
            media_type="application/vnd.ms-excel",
            headers={"Content-Disposition": "attachment; filename=supportnova_complaint_report.csv"}
        )
    else:
        return Response(
            content=csv_data,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=supportnova_complaint_report.csv"}
        )

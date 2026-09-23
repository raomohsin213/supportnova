import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.orm import Session
from app.main import app
from app.database import SyncSessionLocal
from app.schemas.complaint import ComplaintInput
from app.services.validation_engine import validation_engine
from app.services.genai_pipeline import genai_pipeline
from app.services.benchmark_runner import benchmark_runner

@pytest.fixture
def db_session():
    db: Session = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_duplicate_and_repeat_detection(db_session: Session):
    """
    Validates SRS Step 52 (Duplicate Detection) and Step 54 (Repeat Detection).
    """
    # 1. Exact / Near-duplicate test
    dup_input = ComplaintInput(
        complaint_id="TEST-DUP-01",
        customer_name="Arthur Pendelton",
        channel="Email",
        complaint_title="Battery unit exhibiting faint smoke and spark near chemical storage",
        complaint_description="Good afternoon team, just an FYI that the server battery pack we received started emitting white smoke and sparked when connected. No rush at all, please advise when convenient.",
        order_reference="ORD-88412-HAZ"
    )
    
    is_dup, dup_id, is_repeat, rep_count, sim = validation_engine.detect_duplicates_and_repeats(dup_input, db_session)
    assert is_dup is True
    assert dup_id is not None
    assert sim >= 0.85

    # 2. Multi-Issue & Supporting Departments (SRS Step 13 & 24)
    multi_text = "The screen arrived shattered and broken, and courier tracking showed it was delayed 5 days."
    p_issue, s_issue, p_dept, s_depts = validation_engine.detect_multi_issue(multi_text)
    assert "Hardware Defect" in p_issue or "Physical Damage" in p_issue
    assert "Logistics" in s_issue or "Delivery" in s_issue
    assert "Hardware Engineering QA" in p_dept
    assert any("Logistics" in d for d in s_depts)

    # 3. Entity Extraction (SRS Step 16)
    ent_text = "Order ORD-90214 for NovaBook Pro 16 with serial SN-NV9021488, tracking TRK-FDX881299 for $2499."
    entities = validation_engine.extract_entities(ent_text)
    assert entities.get("order_id") == "ORD-90214"
    assert entities.get("serial_number") == "SN-NV9021488"
    assert entities.get("tracking_number") == "TRK-FDX881299"
    assert entities.get("disputed_amount") == "$2499"

@pytest.mark.asyncio
async def test_benchmark_100_audit_and_export():
    """
    Validates SRS Deliverable 8: 100-Case Comparison Report and CSV Export.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Run 100 audit
        response = await ac.post("/api/benchmark/run-100-audit")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        summary = data["data"]
        assert summary["total_evaluated"] >= 100
        assert "accuracy_metrics" in summary
        assert len(summary["audit_matrix"]) >= 100
        
        # Verify 14-column requirements in audit matrix
        first_row = summary["audit_matrix"][0]
        assert "complaint_id" in first_row
        assert "genai_category" in first_row
        assert "python_category" in first_row
        assert "genai_department" in first_row
        assert "python_department" in first_row
        assert "genai_urgency" in first_row
        assert "python_urgency" in first_row
        assert "genai_escalation" in first_row
        assert "python_escalation" in first_row
        assert "match_status" in first_row
        assert "explanation" in first_row

        # Export CSV
        csv_resp = await ac.get("/api/benchmark/export-report")
        assert csv_resp.status_code == 200
        assert "text/csv" in csv_resp.headers["content-type"]
        assert "Complaint ID,Actual/Expected Category" in csv_resp.text
        assert "Dispatch Quarantined" in csv_resp.text

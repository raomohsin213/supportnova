import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.validation_engine import validation_engine

@pytest.mark.asyncio
async def test_auth_login():
    """Verify secure login with hashed password and JWT token generation (FR i)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/auth/login", json={
            "username_or_email": "admin",
            "password": "Admin123!"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["role"] == "system_admin"

@pytest.mark.asyncio
async def test_auth_switch_role():
    """Verify fast persona switching for evaluator assessment (FR ii)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        for role in ["customer", "support_agent", "reviewer", "support_manager", "system_admin"]:
            response = await ac.post("/api/auth/switch-role", json={"role": role})
            assert response.status_code == 200
            data = response.json()
            assert data["user"]["role"] == role

@pytest.mark.asyncio
async def test_customer_tracking_portal():
    """Verify public customer tracking view excludes internal ground-truth diffs (FR lxvi)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/complaints/track/TC-ADV-001")
        assert response.status_code == 200
        data = response.json()
        assert data["complaint_id"] == "TC-ADV-001"
        assert "status" in data
        assert "assigned_department" in data
        assert "customer_response" in data
        assert "diff_summary" not in data  # Internal diffs isolated from public customer
        assert "traceability_score" not in data  # Internal scores isolated

@pytest.mark.asyncio
async def test_analytics_csv_export():
    """Verify analytics CSV report export (FR lxxii-lxxiii)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/analytics/export?format=csv")
        assert response.status_code == 200
        assert "text/csv" in response.headers["content-type"]
        content = response.text
        assert "Complaint ID,Customer Name" in content
        assert "TC-ADV-001" in content

@pytest.mark.asyncio
async def test_pii_masking_utility():
    """Verify customer PII masking for credit cards, phones, and emails (Constraints)."""
    raw_text = "My card 4532-1234-5678-9012 was charged. Call me at 555-839-2019 or email john.doe@example.com."
    masked = validation_engine.mask_pii(raw_text)
    assert "4532-1234-5678-9012" not in masked
    assert "****-****-****-XXXX" in masked
    assert "555-839-2019" not in masked
    assert "***-***-XXXX" in masked
    assert "john.doe@example.com" not in masked

@pytest.mark.asyncio
async def test_customer_reply_and_reopen():
    """Verify customer can reply to a ticket, causing it to reopen for specialist review."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Submit a fresh complaint
        submit_res = await ac.post("/api/complaints/submit", json={
            "customer_name": "Test Reply Customer",
            "customer_email": "reply.customer@example.com",
            "customer_tier": "Standard",
            "channel": "Web Form",
            "complaint_title": "Damaged Cable on Arrival",
            "complaint_description": "The charging cable wire was frayed out of the box.",
            "product_or_service": "Fast Charge USB-C Cable"
        })
        assert submit_res.status_code == 201
        complaint_id = submit_res.json()["complaint_id"]

        # Customer replies
        reply_res = await ac.post(f"/api/tickets/{complaint_id}/customer-reply", json={
            "message": "I checked again and the port is also burnt. Please advise immediately.",
            "customer_email": "reply.customer@example.com"
        })
        assert reply_res.status_code == 200
        reply_data = reply_res.json()
        assert reply_data["status"] == "Reopened"
        assert reply_data["is_automated_dispatch_blocked"] is True
        assert len(reply_data["conversation_history"]) >= 2

@pytest.mark.asyncio
async def test_customer_close_ticket():
    """Verify customer can approve resolution and close ticket."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Submit complaint
        submit_res = await ac.post("/api/complaints/submit", json={
            "customer_name": "Happy Customer",
            "customer_email": "happy@example.com",
            "customer_tier": "VIP",
            "channel": "Web Form",
            "complaint_title": "Minor delivery inquiry",
            "complaint_description": "Package was delayed by 2 hours.",
            "product_or_service": "Nova Speaker"
        })
        assert submit_res.status_code == 201
        complaint_id = submit_res.json()["complaint_id"]

        # Close ticket
        close_res = await ac.post(f"/api/tickets/{complaint_id}/customer-close", json={
            "customer_feedback": "Thank you for the quick replacement, closing ticket now!"
        })
        assert close_res.status_code == 200
        close_data = close_res.json()
        assert close_data["status"] == "Resolved & Closed"
        assert close_data["is_automated_dispatch_blocked"] is False


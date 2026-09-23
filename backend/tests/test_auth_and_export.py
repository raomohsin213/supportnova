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

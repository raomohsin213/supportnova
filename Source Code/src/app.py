"""SupportNova Main Web Application (FastAPI / ASGI)."""
import os
import sys
from pathlib import Path

# Add Source Code root to path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes.complaint_routes import router as complaint_router
from src.routes.admin_routes import router as admin_router

app = FastAPI(
    title="SupportNova ResponseX Intelligence",
    description="TechWiz 7 Dual-Pipeline Complaint Intelligence Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaint_router, prefix="/api")
app.include_router(admin_router, prefix="/api")

@app.get("/")
def home():
    return {
        "system": "SupportNova Autonomous AI Governance System",
        "status": "Operational",
        "dual_pipeline": True,
        "docs": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "healthy", "service": "supportnova-core"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("src.app:app", host="0.0.0.0", port=port, reload=True)

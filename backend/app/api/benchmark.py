"""
SupportNova Benchmark Evaluator API Router (SRS Deliverable 8)
Provides endpoints to execute 100-case automated audit and export comparison report to CSV.
"""

from fastapi import APIRouter, Depends, Response, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database import SyncSessionLocal
from app.services.benchmark_runner import benchmark_runner

router = APIRouter(prefix="/benchmark", tags=["Benchmark & Evaluator Audits"])

def get_sync_db():
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/run-100-audit")
def run_100_audit(db: Session = Depends(get_sync_db)):
    """
    Executes automated dual-pipeline evaluation over 100 unseen complaints (SRS Section 1.10 Item 8).
    Compiles comparison matrix, verifies accuracy across 4 dimensions, and returns live telemetry.
    """
    result = benchmark_runner.run_100_audit(db)
    return {
        "success": True,
        "data": result
    }

@router.get("/latest")
def get_latest_benchmark(db: Session = Depends(get_sync_db)):
    """
    Returns latest benchmark audit telemetry and matrix.
    """
    result = benchmark_runner.get_latest(db)
    return {
        "success": True,
        "data": result
    }

@router.get("/export-report")
def export_benchmark_report(db: Session = Depends(get_sync_db)):
    """
    Exports the complete 14-column comparison matrix as an RFC-4180 CSV document.
    """
    latest = benchmark_runner.get_latest(db)
    matrix = latest.get("audit_matrix", [])
    csv_content = benchmark_runner.export_csv(matrix)
    
    filename = "SupportNova_100_Case_Benchmark_Comparison_Report.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache"
        }
    )

"""Complaint Processing API Routes."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from complaint_processing.submission import complaint_submission
from genai_pipeline.complaint_analyzer import complaint_analyzer
from genai_pipeline.response_generator import response_generator

router = APIRouter(tags=["Complaints"])

class ComplaintRequest(BaseModel):
    complaint_text: str
    customer_id: str = "CUST-001"
    customer_name: str = "Valued Customer"
    customer_email: str = "customer@example.com"
    channel: str = "Web Portal"

@router.post("/complaints/submit")
def submit_complaint_endpoint(req: ComplaintRequest):
    intake = complaint_submission.ingest_complaint(req.model_dump())
    analysis = complaint_analyzer.analyze(intake["complaint_text"])
    response = response_generator.generate_response(analysis, req.customer_name)
    return {
        "status": "success",
        "ticket": intake,
        "analysis": analysis,
        "generated_response": response
    }

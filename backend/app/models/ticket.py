import json
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, Boolean, DateTime
from app.database import Base

class ComplaintTicket(Base):
    __tablename__ = "complaint_tickets"
    
    complaint_id = Column(String(50), primary_key=True, index=True)
    customer_name = Column(String(150), nullable=False)
    customer_tier = Column(String(50), nullable=False, default="Standard")  # Standard / VIP
    channel = Column(String(50), nullable=False, default="Web Form")  # Web Form, Email, Chat, Upload
    complaint_title = Column(String(250), nullable=False)
    complaint_description = Column(Text, nullable=False)
    order_reference = Column(String(100), nullable=True)
    transaction_date = Column(String(50), nullable=True)
    previous_complaints_count = Column(Integer, default=0)
    
    # Dual-Pipeline Outputs (JSON)
    genai_output_json = Column(Text, nullable=True)
    validation_output_json = Column(Text, nullable=True)
    diff_summary_json = Column(Text, nullable=True)
    
    # Synthesis & Verification State
    # Verified | Verified with Warning | Partially Verified | Source Support Missing |
    # Requirement Missing | Unsupported Requirement | Outdated Source | Contradiction Detected | Manual Review Required
    status = Column(String(60), nullable=False, index=True, default="Manual Review Required")
    
    # Calculated Scores
    coverage_score = Column(Float, default=0.0)      # Mandatory steps coverage (0-100%)
    traceability_score = Column(Float, default=0.0)  # Policy citation validity (0-100%)
    routing_score = Column(Float, default=0.0)       # Department routing alignment (0-100%)
    overall_confidence_score = Column(Float, default=0.0)
    
    # Ground-truth consolidated fields
    assigned_department = Column(String(100), nullable=True)
    final_priority = Column(String(10), nullable=True)  # P1, P2, P3, P4
    final_urgency = Column(String(20), nullable=True)   # Low, Medium, High, Critical
    final_sentiment = Column(String(30), nullable=True)
    
    # Governance & Dispatch Control
    is_automated_dispatch_blocked = Column(Boolean, default=False)
    human_reviewer_action = Column(String(50), default="Pending")  # Pending, Approved, Overridden, Escalated
    human_reviewer_notes = Column(Text, nullable=True)
    
    # Advanced SLA, PII & Repeat Tracking
    pii_masked_description = Column(Text, nullable=True)
    sla_target_hours = Column(Integer, default=24)
    is_sla_at_risk = Column(Boolean, default=False)
    is_repeat_complaint = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @property
    def genai_output(self) -> dict:
        return json.loads(self.genai_output_json) if self.genai_output_json else {}

    @genai_output.setter
    def genai_output(self, val: dict):
        self.genai_output_json = json.dumps(val)

    @property
    def validation_output(self) -> dict:
        return json.loads(self.validation_output_json) if self.validation_output_json else {}

    @validation_output.setter
    def validation_output(self, val: dict):
        self.validation_output_json = json.dumps(val)

    @property
    def diff_summary(self) -> dict:
        return json.loads(self.diff_summary_json) if self.diff_summary_json else {}

    @diff_summary.setter
    def diff_summary(self, val: dict):
        self.diff_summary_json = json.dumps(val)

    def to_customer_dict(self) -> dict:
        """Safe customer-facing view excluding internal diff scores and validation engine logs."""
        genai = self.genai_output
        customer_msg = genai.get("professional_response") or "Your complaint has been logged and is undergoing review."
        return {
            "complaint_id": self.complaint_id,
            "complaint_title": self.complaint_title,
            "status": self.status,
            "assigned_department": self.assigned_department or "Customer Relations",
            "submitted_date": self.created_at.strftime("%Y-%m-%d %H:%M UTC") if self.created_at else None,
            "latest_update": self.updated_at.strftime("%Y-%m-%d %H:%M UTC") if self.updated_at else None,
            "customer_response": customer_msg,
            "sla_target_hours": self.sla_target_hours,
            "is_sla_at_risk": self.is_sla_at_risk,
            "is_repeat_complaint": self.is_repeat_complaint
        }

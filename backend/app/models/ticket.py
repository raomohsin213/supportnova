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
    product_or_service = Column(String(150), nullable=True)
    product_image_url = Column(Text, nullable=True)
    evidence_image_url = Column(Text, nullable=True)
    order_reference = Column(String(100), nullable=True)
    transaction_date = Column(String(50), nullable=True)
    customer_email = Column(String(150), nullable=True)
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
    primary_department = Column(String(100), nullable=True)
    supporting_departments_json = Column(Text, nullable=True)
    primary_issue = Column(String(150), nullable=True)
    secondary_issue = Column(String(150), nullable=True)
    product_or_service = Column(String(150), nullable=True)
    final_priority = Column(String(10), nullable=True)  # P1, P2, P3, P4
    final_urgency = Column(String(20), nullable=True)   # Low, Medium, High, Critical
    final_sentiment = Column(String(30), nullable=True)
    escalation_level = Column(String(60), default="No Escalation")  # No Escalation, Supervisor Review, Department Manager, Specialist Team, Compliance Review, Critical Management Escalation
    
    # Governance & Dispatch Control
    is_automated_dispatch_blocked = Column(Boolean, default=False)
    human_reviewer_action = Column(String(50), default="Pending")  # Pending, Approved, Overridden, Escalated
    human_reviewer_notes = Column(Text, nullable=True)
    official_resolution_message = Column(Text, nullable=True)
    
    # Advanced SLA, PII, Duplicates & Repeat Tracking
    pii_masked_description = Column(Text, nullable=True)
    sla_target_hours = Column(Integer, default=24)
    is_sla_at_risk = Column(Boolean, default=False)
    is_duplicate = Column(Boolean, default=False)
    duplicate_of_id = Column(String(50), nullable=True)
    is_repeat_complaint = Column(Boolean, default=False)
    repeat_count = Column(Integer, default=0)
    
    # Actionable Communication & Entities
    extracted_entities_json = Column(Text, nullable=True)
    clarification_questions_json = Column(Text, nullable=True)
    follow_up_message = Column(Text, nullable=True)
    
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

    @property
    def supporting_departments(self) -> list:
        return json.loads(self.supporting_departments_json) if self.supporting_departments_json else []

    @supporting_departments.setter
    def supporting_departments(self, val: list):
        self.supporting_departments_json = json.dumps(val)

    @property
    def extracted_entities(self) -> dict:
        return json.loads(self.extracted_entities_json) if self.extracted_entities_json else {}

    @extracted_entities.setter
    def extracted_entities(self, val: dict):
        self.extracted_entities_json = json.dumps(val)

    @property
    def clarification_questions(self) -> list:
        return json.loads(self.clarification_questions_json) if self.clarification_questions_json else []

    @clarification_questions.setter
    def clarification_questions(self, val: list):
        self.clarification_questions_json = json.dumps(val)

    def to_customer_dict(self) -> dict:
        """Safe customer-facing view excluding internal diff scores and validation engine logs."""
        genai = self.genai_output
        is_approved = (
            self.human_reviewer_action in ["Approved", "Admin Approved", "Overridden", "Auto-Approved"]
            or (self.status == "Verified" and not self.is_automated_dispatch_blocked)
        )
        if is_approved:
            customer_msg = (
                self.official_resolution_message 
                or genai.get("professional_response") 
                or "Your complaint has been verified and resolved."
            )
            if self.human_reviewer_notes:
                customer_msg = f"{customer_msg}\n\n[Staff Resolution Note]: {self.human_reviewer_notes}"
        else:
            customer_msg = "Your complaint and attached defect evidence photo have been logged successfully. Support Specialist is reviewing the drafted resolution against corporate warranty policy. You will receive the official verified response here once approved."
        return {
            "complaint_id": self.complaint_id,
            "complaint_title": self.complaint_title,
            "complaint_description": self.complaint_description,
            "product_or_service": self.product_or_service,
            "product_image_url": self.product_image_url,
            "evidence_image_url": self.evidence_image_url,
            "order_reference": self.order_reference,
            "customer_name": self.customer_name,
            "customer_email": self.customer_email,
            "status": self.status,
            "assigned_department": self.primary_department or self.assigned_department or "Customer Relations",
            "primary_issue": self.primary_issue or self.complaint_title,
            "secondary_issue": self.secondary_issue,
            "escalation_level": self.escalation_level,
            "human_reviewer_action": self.human_reviewer_action,
            "human_reviewer_notes": self.human_reviewer_notes,
            "is_automated_dispatch_blocked": self.is_automated_dispatch_blocked,
            "submitted_date": self.created_at.strftime("%Y-%m-%d %H:%M UTC") if self.created_at else None,
            "latest_update": self.updated_at.strftime("%Y-%m-%d %H:%M UTC") if self.updated_at else None,
            "customer_response": customer_msg,
            "sla_target_hours": self.sla_target_hours,
            "is_sla_at_risk": self.is_sla_at_risk,
            "is_duplicate": self.is_duplicate,
            "is_repeat_complaint": self.is_repeat_complaint
        }

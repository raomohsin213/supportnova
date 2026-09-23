from typing import Literal, Optional, Dict, List
from pydantic import BaseModel, Field

class GenAIComplaintAnalysis(BaseModel):
    complaint_id: str
    issue_category: str
    subcategory: str
    primary_issue: str = Field(default="", description="Identified core complaint issue")
    secondary_issue: Optional[str] = Field(None, description="Secondary or collateral issue if multi-issue")
    product_or_service: str = Field(default="General Product/Service", description="The identified product/service in dispute")
    sentiment: Literal["Positive", "Neutral", "Negative", "Severely Distressed"]
    urgency: Literal["Low", "Medium", "High", "Critical"]
    priority: Literal["P1", "P2", "P3", "P4"]
    department: str
    primary_department: str = Field(default="", description="Primary responsible department")
    supporting_departments: List[str] = Field(default_factory=list, description="Supporting departments for multi-issue handling")
    escalation_level: Literal["No Escalation", "Supervisor Review", "Department Manager", "Specialist Team", "Compliance Review", "Critical Management Escalation"] = "No Escalation"
    policy_id: str
    policy_section: str
    resolution_steps: List[str] = Field(default_factory=list)
    escalation_required: bool
    escalation_reason: Optional[str] = None
    professional_response: str
    follow_up_required: bool
    follow_up_message: Optional[str] = Field(None, description="Concrete follow-up message sent to customer if further investigation is needed")
    internal_agent_guidance: str
    clarification_questions: List[str] = Field(default_factory=list, description="Specific questions if critical details are missing from the complaint")
    extracted_entities: Dict[str, str] = Field(default_factory=dict, description="Extracted entities (Order ID, Tracking, Amounts, Dates, Serials)")
    prohibited_action_detected: bool = False

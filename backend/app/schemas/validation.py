from typing import Literal, Optional, Any
from pydantic import BaseModel, Field

class DiscrepancyItem(BaseModel):
    field: str
    severity: Literal["CRITICAL", "WARNING", "INFO"]
    genai_value: Any
    ground_truth_value: Any
    rule_code: str
    description: str
    is_overridden: bool = False

class GroundTruthValidationResult(BaseModel):
    complaint_id: str
    validated_category: str
    validated_subcategory: str
    validated_primary_issue: Optional[str] = None
    validated_secondary_issue: Optional[str] = None
    allowed_departments: list[str]
    routing_valid: bool
    recommended_department: str
    primary_department: Optional[str] = None
    supporting_departments: list[str] = Field(default_factory=list)
    
    # Sentiment vs. Urgency Trap Decoupling
    hazard_detected: bool = False
    hazard_keywords_found: list[str] = Field(default_factory=list)
    tone_bias_detected: bool = False
    calculated_urgency: Literal["Low", "Medium", "High", "Critical"]
    calculated_priority: Literal["P1", "P2", "P3", "P4"]
    urgency_overridden: bool = False
    priority_overridden: bool = False
    
    # Mandatory Escalation & Multi-Tier Hierarchy
    mandatory_escalation_triggered: bool = False
    escalation_triggers_matched: list[str] = Field(default_factory=list)
    missing_mandatory_escalation: bool = False
    escalation_level: Literal["No Escalation", "Supervisor Review", "Department Manager", "Specialist Team", "Compliance Review", "Critical Management Escalation"] = "No Escalation"
    
    # Duplicate & Repeat Detection (SRS Step 52, 54)
    is_duplicate: bool = False
    duplicate_of_id: Optional[str] = None
    is_repeat_complaint: bool = False
    repeat_count: int = 0
    duplicate_similarity_score: float = 0.0
    
    # Actionable Follow-up, Entities & Questions
    extracted_entities: dict[str, str] = Field(default_factory=dict)
    clarification_questions: list[str] = Field(default_factory=list)
    follow_up_message: Optional[str] = None
    
    # Source Traceability
    policy_citation_valid: bool = False
    policy_version_status: Literal["Active", "Superseded", "Deprecated", "NotFound"] = "NotFound"
    policy_doc_title: Optional[str] = None
    policy_section_heading: Optional[str] = None
    policy_chunk_content: Optional[str] = None
    
    # Action Scanners
    prohibited_actions_detected: list[str] = Field(default_factory=list)
    mandatory_actions_total: int = 0
    mandatory_actions_covered: list[str] = Field(default_factory=list)
    mandatory_actions_missing: list[str] = Field(default_factory=list)
    
    # Mathematical Scores
    coverage_score: float = 0.0      # (Covered / Total) * 100
    traceability_score: float = 0.0  # 100% if active, 0% if hallucinated or outdated
    routing_score: float = 0.0       # 100% if strictly allowed, 0% otherwise
    overall_confidence_score: float = 0.0
    
    # Discrepancies and State
    discrepancies: list[DiscrepancyItem] = Field(default_factory=list)
    final_status: str
    block_automated_dispatch: bool = False
    reason_for_blocking: Optional[str] = None

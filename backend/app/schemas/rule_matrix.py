from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class RuleMatrixEntryBase(BaseModel):
    category: str
    subcategory: str
    allowed_departments: list[str] = Field(default_factory=list)
    sla_hours_by_priority: dict[str, int] = Field(default_factory=lambda: {"P1": 2, "P2": 8, "P3": 24, "P4": 48})
    mandatory_escalation_triggers: list[str] = Field(default_factory=list)
    prohibited_actions: list[str] = Field(default_factory=list)
    mandatory_actions: list[str] = Field(default_factory=list)
    active_policy_id: str
    active_section_id: str

class RuleMatrixEntryCreate(RuleMatrixEntryBase):
    pass

class RuleMatrixEntryUpdate(BaseModel):
    category: Optional[str] = None
    subcategory: Optional[str] = None
    allowed_departments: Optional[list[str]] = None
    sla_hours_by_priority: Optional[dict[str, int]] = None
    mandatory_escalation_triggers: Optional[list[str]] = None
    prohibited_actions: Optional[list[str]] = None
    mandatory_actions: Optional[list[str]] = None
    active_policy_id: Optional[str] = None
    active_section_id: Optional[str] = None

class RuleMatrixEntryRead(RuleMatrixEntryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

import json
from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime
from app.database import Base

class RuleMatrixEntry(Base):
    __tablename__ = "rule_matrix_entries"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    category = Column(String(100), nullable=False, index=True)
    subcategory = Column(String(100), nullable=False, index=True)
    
    # JSON-encoded lists & dicts
    allowed_departments_json = Column(Text, nullable=False, default="[]")
    sla_hours_by_priority_json = Column(Text, nullable=False, default='{"P1": 2, "P2": 8, "P3": 24, "P4": 48}')
    mandatory_escalation_triggers_json = Column(Text, nullable=False, default="[]")
    prohibited_actions_json = Column(Text, nullable=False, default="[]")
    mandatory_actions_json = Column(Text, nullable=False, default="[]")
    
    active_policy_id = Column(String(50), nullable=False)
    active_section_id = Column(String(100), nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @property
    def allowed_departments(self) -> list[str]:
        return json.loads(self.allowed_departments_json) if self.allowed_departments_json else []
        
    @allowed_departments.setter
    def allowed_departments(self, val: list[str]):
        self.allowed_departments_json = json.dumps(val)

    @property
    def sla_hours_by_priority(self) -> dict[str, int]:
        return json.loads(self.sla_hours_by_priority_json) if self.sla_hours_by_priority_json else {"P1": 2, "P2": 8, "P3": 24, "P4": 48}
        
    @sla_hours_by_priority.setter
    def sla_hours_by_priority(self, val: dict[str, int]):
        self.sla_hours_by_priority_json = json.dumps(val)

    @property
    def mandatory_escalation_triggers(self) -> list[str]:
        return json.loads(self.mandatory_escalation_triggers_json) if self.mandatory_escalation_triggers_json else []
        
    @mandatory_escalation_triggers.setter
    def mandatory_escalation_triggers(self, val: list[str]):
        self.mandatory_escalation_triggers_json = json.dumps(val)

    @property
    def prohibited_actions(self) -> list[str]:
        return json.loads(self.prohibited_actions_json) if self.prohibited_actions_json else []
        
    @prohibited_actions.setter
    def prohibited_actions(self, val: list[str]):
        self.prohibited_actions_json = json.dumps(val)

    @property
    def mandatory_actions(self) -> list[str]:
        return json.loads(self.mandatory_actions_json) if self.mandatory_actions_json else []
        
    @mandatory_actions.setter
    def mandatory_actions(self, val: list[str]):
        self.mandatory_actions_json = json.dumps(val)

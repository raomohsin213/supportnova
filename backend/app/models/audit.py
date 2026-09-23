from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    ticket_id = Column(String(50), nullable=False, index=True)
    actor = Column(String(100), nullable=False)  # "Pipeline 1 GenAI", "Pipeline 2 Ground Truth", "Agent (Diff Inspector)", "System"
    action = Column(String(100), nullable=False)  # "Triage", "Override Applied", "Approved", "Escalated", "Rule Updated"
    previous_state = Column(Text, nullable=True)
    new_state = Column(Text, nullable=True)
    rationale = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

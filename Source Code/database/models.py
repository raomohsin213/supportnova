"""SQLAlchemy ORM Models for SupportNova."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime
from database.db_config import Base

class Complaint(Base):
    __tablename__ = "complaint_records"
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String(50), unique=True, index=True)
    customer_id = Column(String(50), index=True)
    customer_name = Column(String(100))
    customer_email = Column(String(100))
    channel = Column(String(30), default="Web Portal")
    complaint_text = Column(Text, nullable=False)
    category = Column(String(50))
    urgency = Column(String(20))
    department = Column(String(80))
    status = Column(String(30), default="Open")
    verification_score = Column(Float, default=100.0)
    escalation_required = Column(Boolean, default=False)
    escalation_tier = Column(String(50), default="No Escalation")
    ai_resolution = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Policy(Base):
    __tablename__ = "policy_records"
    id = Column(Integer, primary_key=True, index=True)
    doc_id = Column(String(50), unique=True, index=True)
    doc_title = Column(String(200))
    version = Column(String(20))
    effective_date = Column(String(30))
    category = Column(String(50))
    status = Column(String(20), default="Active")
    content = Column(Text)

class AuditEntry(Base):
    __tablename__ = "audit_records"
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String(50), index=True)
    action = Column(String(80))
    actor = Column(String(80), default="System")
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

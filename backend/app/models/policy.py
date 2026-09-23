from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base

class PolicyDocument(Base):
    __tablename__ = "policy_documents"
    
    doc_id = Column(String(50), primary_key=True, index=True)
    doc_title = Column(String(200), nullable=False)
    version = Column(String(50), nullable=False)  # e.g., "v1.0-Active", "v1.0-Superseded"
    effective_date = Column(String(50), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    status = Column(String(50), nullable=False, default="Active", index=True)  # Active, Superseded, Deprecated
    file_path = Column(String(500), nullable=True)
    file_type = Column(String(20), nullable=True)  # pdf, docx, manual
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    chunks = relationship("PolicyChunk", back_populates="document", cascade="all, delete-orphan")

class PolicyChunk(Base):
    __tablename__ = "policy_chunks"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    chunk_id = Column(String(100), unique=True, nullable=False, index=True)
    doc_id = Column(String(50), ForeignKey("policy_documents.doc_id"), nullable=False, index=True)
    section_id = Column(String(100), nullable=False)  # e.g. "Section 5.2", "Clause 3.1"
    heading = Column(String(250), nullable=True)
    content = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    version = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default="Active")  # Active, Superseded, Deprecated
    created_at = Column(DateTime, default=datetime.utcnow)
    
    document = relationship("PolicyDocument", back_populates="chunks")

Index("idx_policy_chunk_lookup", PolicyChunk.doc_id, PolicyChunk.section_id)

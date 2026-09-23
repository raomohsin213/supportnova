from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, Float, DateTime
from app.database import Base

class GenAIRun(Base):
    __tablename__ = "genai_runs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    ticket_id = Column(String(50), nullable=False, index=True)
    model_name = Column(String(100), nullable=False)  # e.g., "gemini-2.0-flash"
    prompt_version = Column(String(50), nullable=False, default="v1.2-enterprise")
    latency_ms = Column(Float, default=0.0)
    tokens_used = Column(Integer, default=0)
    retry_count = Column(Integer, default=0)
    raw_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "ticket_id": self.ticket_id,
            "model_name": self.model_name,
            "prompt_version": self.prompt_version,
            "latency_ms": self.latency_ms,
            "tokens_used": self.tokens_used,
            "retry_count": self.retry_count,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

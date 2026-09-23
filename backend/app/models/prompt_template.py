from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime
from app.database import Base

class PromptTemplate(Base):
    __tablename__ = "prompt_templates"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    version = Column(String(50), unique=True, nullable=False, index=True)  # e.g., "v1.2-enterprise"
    name = Column(String(150), nullable=False)
    system_instructions = Column(Text, nullable=False)
    xml_schema_def = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "version": self.version,
            "name": self.name,
            "system_instructions": self.system_instructions,
            "xml_schema_def": self.xml_schema_def,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

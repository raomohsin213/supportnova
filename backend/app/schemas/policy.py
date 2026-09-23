from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class PolicyChunkRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    chunk_id: str
    doc_id: str
    section_id: str
    heading: Optional[str] = None
    content: str
    category: str
    version: str
    status: str

class PolicyDocumentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    doc_id: str
    doc_title: str
    version: str
    effective_date: str
    category: str
    status: str
    file_type: Optional[str] = None
    uploaded_at: Optional[datetime] = None
    chunk_count: int = 0
    chunks: list[PolicyChunkRead] = Field(default_factory=list)

class PolicyUploadResponse(BaseModel):
    message: str
    doc_id: str
    doc_title: str
    version: str
    chunks_created: int

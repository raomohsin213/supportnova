from typing import Literal, Optional
from pydantic import BaseModel, Field

class ComplaintInput(BaseModel):
    complaint_id: Optional[str] = Field(None, description="Unique ticket/complaint ID (auto-generated if not provided)")
    customer_name: str = Field(..., min_length=1, description="Customer full name")
    customer_tier: Literal["Standard", "VIP"] = Field("Standard", description="Customer loyalty tier")
    channel: Literal["Web Form", "Email", "Chat", "Upload", "Complaint Upload"] = Field("Web Form", description="Intake channel")
    complaint_title: str = Field(..., min_length=2, max_length=300, description="Summary title of the issue")
    complaint_description: str = Field(..., min_length=5, description="Full customer narrative")
    product_or_service: Optional[str] = Field(None, description="Product or service in dispute")
    order_reference: Optional[str] = Field(None, description="Order, shipment, or invoice reference ID")
    transaction_date: Optional[str] = Field(None, description="Date of the purchase or incident")
    previous_complaints_count: int = Field(0, ge=0, description="Customer past ticket count")

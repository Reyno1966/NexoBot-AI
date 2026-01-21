from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class ChatRequest(BaseModel):
    message: str
    tenant_id: UUID
    customer_id: Optional[UUID] = None
    industry_override: Optional[str] = None
    language: Optional[str] = "es"

class ChatResponse(BaseModel):
    response: str
    intent: str
    action_required: bool = False
    metadata: Optional[dict] = None

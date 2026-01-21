from pydantic import BaseModel, EmailStr
from uuid import UUID
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    industry: str
    phone: str
    address: Optional[str] = None
    country: str
    main_interest: Optional[str] = "Citas"

class TenantRead(BaseModel):
    id: UUID
    name: str
    industry: str
    phone: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    main_interest: Optional[str] = None

class UserResponse(BaseModel):
    id: UUID
    email: str
    tenant_id: Optional[UUID]
    tenant: Optional[TenantRead] = None # Información del negocio incluida

class Token(BaseModel):
    access_token: str
    token_type: str

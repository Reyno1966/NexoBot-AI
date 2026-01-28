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
    logo_url: Optional[str] = None
    currency: Optional[str] = "USD"
    services: Optional[str] = "[]"
    business_hours: Optional[str] = "{}"
    is_locked: Optional[bool] = False
    stripe_customer_id: Optional[str] = None
    stripe_public_key: Optional[str] = None
    stripe_secret_key: Optional[str] = None
    whatsapp_notifications_enabled: bool = False
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = 587
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    whatsapp_api_key: Optional[str] = None
    whatsapp_phone: Optional[str] = None

class TenantPublicRead(BaseModel):
    id: UUID
    name: str
    industry: str
    phone: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    main_interest: Optional[str] = None
    logo_url: Optional[str] = None
    currency: Optional[str] = "USD"
    services: Optional[str] = "[]"
    business_hours: Optional[str] = "{}"
    stripe_public_key: Optional[str] = None
    whatsapp_notifications_enabled: bool = False

class TenantUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    main_interest: Optional[str] = None
    logo_url: Optional[str] = None
    currency: Optional[str] = None
    services: Optional[str] = None
    business_hours: Optional[str] = None
    stripe_public_key: Optional[str] = None
    stripe_secret_key: Optional[str] = None
    whatsapp_notifications_enabled: Optional[bool] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    whatsapp_api_key: Optional[str] = None
    whatsapp_phone: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class UserResponse(BaseModel):
    id: UUID
    email: str
    tenant_id: Optional[UUID]
    tenant: Optional[TenantRead] = None # Información del negocio incluida

class Token(BaseModel):
    access_token: str
    token_type: str

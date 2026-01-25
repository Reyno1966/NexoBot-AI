from datetime import datetime, timedelta
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

class TenantBase(SQLModel):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    industry: str
    phone: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    main_interest: Optional[str] = None # Interés principal (Citas, Facturas, Marketing, Asistente)
    trial_ends_at: datetime = Field(default_factory=lambda: datetime.utcnow() + timedelta(days=7))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MultiTenantModel(SQLModel):
    tenant_id: UUID = Field(foreign_key="tenant.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Tenant(TenantBase, table=True):
    logo_url: Optional[str] = None
    currency: str = "USD"
    services: str = "[]"
    business_hours: str = "{}"
    is_locked: bool = False
    stripe_customer_id: Optional[str] = None # Para gestión de suscripciones (nos pagan a nosotros)
    stripe_public_key: Optional[str] = None # Para que ellos cobren (su cuenta)
    stripe_secret_key: Optional[str] = None # Para que ellos cobren (su cuenta)
    
    users: List["User"] = Relationship(back_populates="tenant")
    customers: List["Customer"] = Relationship(back_populates="tenant")

class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    is_active: bool = True
    is_admin: bool = False
    tenant_id: Optional[UUID] = Field(default=None, foreign_key="tenant.id")
    
    tenant: Optional[Tenant] = Relationship(back_populates="users")

class Customer(MultiTenantModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    full_name: str
    phone: str
    email: Optional[str] = None
    preferences: str = ""  # For RAG context
    
    tenant: "Tenant" = Relationship(back_populates="customers")
    
class Transaction(MultiTenantModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    customer_id: UUID = Field(foreign_key="customer.id")
    amount: float
    description: str
    is_income: bool = True
    invoice_url: Optional[str] = None

class Booking(MultiTenantModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    property_name: str # Nombre del apartamento/habitación (de tenant.services)
    customer_id: Optional[UUID] = Field(default=None, foreign_key="customer.id")
    start_date: datetime
    end_date: datetime
    status: str = "confirmed" # confirmed, pending, cancelled
    total_price: float = 0.0
    notes: str = ""

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlmodel import Session, select
from app.db import get_session
from app.models.base import Tenant, Customer, Booking, Transaction, ChatMessage
from typing import List
from uuid import UUID
# No external verify_token needed, we use jwt.decode locally

router = APIRouter()

def get_db():
    from app.db import get_session
    yield from get_session()

def get_tenant_id_from_token(token: str):
    from app.core.security import jwt, settings
    try:
        payload = jwt.decode(token.replace("Bearer ", ""), settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("tenant_id")
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")

@router.get("/bookings", response_model=List[Booking])
def get_bookings(session: Session = Depends(get_db), token: str = Header(...)):
    tenant_id = get_tenant_id_from_token(token)
    return session.exec(select(Booking).where(Booking.tenant_id == tenant_id)).all()

@router.get("/customers", response_model=List[Customer])
def get_customers(session: Session = Depends(get_db), token: str = Header(...)):
    tenant_id = get_tenant_id_from_token(token)
    return session.exec(select(Customer).where(Customer.tenant_id == tenant_id)).all()

@router.get("/transactions", response_model=List[Transaction])
def get_transactions(session: Session = Depends(get_db), token: str = Header(...)):
    tenant_id = get_tenant_id_from_token(token)
    return session.exec(select(Transaction).where(Transaction.tenant_id == tenant_id)).all()

@router.get("/messages", response_model=List[ChatMessage])
def get_messages(session: Session = Depends(get_db), token: str = Header(...)):
    tenant_id = get_tenant_id_from_token(token)
    return session.exec(select(ChatMessage).where(ChatMessage.tenant_id == tenant_id).order_by(ChatMessage.created_at.desc())).all()

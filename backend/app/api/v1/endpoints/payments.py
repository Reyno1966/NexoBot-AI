from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlmodel import Session, select
from app.db import get_session
from app.models.base import Tenant
from app.services.stripe_service import StripeService
import stripe
from app.core.config import settings
from typing import Optional

def get_db():
    from app.db import get_session
    yield from get_session()

router = APIRouter()

@router.post("/create-checkout-session")
def create_checkout(tenant_id: str, amount: float = 19.99, session: Session = Depends(get_db)):
    tenant = session.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")
    
    # URL de éxito y cancelación
    success_url = f"{settings.FRONTEND_URL}?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{settings.FRONTEND_URL}?payment=failed"
    
    checkout_url = StripeService.create_checkout_session(
        customer_email=f"admin@{tenant.id}.com",
        success_url=success_url,
        cancel_url=cancel_url,
        amount=amount
    )
    
    if not checkout_url:
        raise HTTPException(status_code=400, detail="Error al crear sesión de pago")
        
    return {"url": checkout_url}

@router.post("/create-portal-session")
def create_portal(tenant_id: str, session: Session = Depends(get_db)):
    tenant = session.get(Tenant, tenant_id)
    if not tenant or not tenant.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No se encontró suscripción activa para este negocio.")
    
    return_url = settings.FRONTEND_URL
    portal_url = StripeService.create_customer_portal_session(
        customer_id=tenant.stripe_customer_id,
        return_url=return_url
    )
    
    if not portal_url:
        raise HTTPException(status_code=400, detail="Error al conectar con el portal de pagos.")
        
    return {"url": portal_url}

@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: Optional[str] = Header(None)):
    payload = await request.body()
    
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        return {"error": str(e)}

    # Manejar el evento de pago exitoso
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        # Aquí buscaríamos al tenant por email o metadata y activaríamos su suscripción
        print(f"💰 ¡Pago exitoso recibido! Sesión: {session['id']}")
        
    return {"status": "success"}

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

from uuid import UUID

@router.post("/create-checkout-session")
def create_checkout(tenant_id: UUID, request: Request, amount: float = 9.99, session: Session = Depends(get_db)):
    tenant = session.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")
    
    # URL de éxito y cancelación
    # Intentamos detectar la URL base dinámicamente si es posible
    base_frontend = settings.FRONTEND_URL
    if base_frontend == "*" or not base_frontend:
        # Usamos el Host de la petición actual o el fallback correcto con guión
        referer = request.headers.get("referer")
        if referer:
            base_frontend = "/".join(referer.split("/")[:3])
        else:
            base_frontend = "https://nexo-bot-ai.vercel.app" 
    
    success_url = f"{base_frontend}/?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{base_frontend}/?payment=failed"
    
    checkout_url = StripeService.create_checkout_session(
        tenant_id=str(tenant.id),
        tenant_name=tenant.name,
        customer_email=f"admin@{tenant.id}.com",
        success_url=success_url,
        cancel_url=cancel_url,
        amount=amount
    )
    
    if not checkout_url:
        raise HTTPException(status_code=400, detail="Error al crear sesión de pago")
        
    return {"url": checkout_url}

@router.post("/create-portal-session")
def create_portal(tenant_id: UUID, session: Session = Depends(get_db)):
    tenant = session.get(Tenant, tenant_id)
    if not tenant or not tenant.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No se encontró suscripción activa para este negocio.")
    
    return_url = settings.FRONTEND_URL
    if return_url == "*" or not return_url:
        return_url = "https://nexo-bot-ai.vercel.app"
        
    portal_url = StripeService.create_customer_portal_session(
        customer_id=tenant.stripe_customer_id,
        return_url=return_url
    )
    
    if not portal_url:
        raise HTTPException(status_code=400, detail="Error al conectar con el portal de pagos.")
        
    return {"url": portal_url}

@router.post("/webhook")
async def stripe_webhook(
    request: Request, 
    stripe_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    payload = await request.body()
    
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        print(f"⚠️ Error Webhook Stripe: {str(e)}")
        return {"error": str(e)}

    # 1. Pago de suscripción completado con éxito
    if event['type'] == 'checkout.session.completed':
        session_data = event['data']['object']
        tenant_id = session_data.get('metadata', {}).get('tenant_id')
        customer_id = session_data.get('customer')
        
        if tenant_id:
            tenant = db.get(Tenant, tenant_id)
            if tenant:
                tenant.is_locked = False
                tenant.stripe_customer_id = customer_id
                db.add(tenant)
                db.commit()
                print(f"💰 [WEBHOOK] Suscripción activada para Tenant: {tenant.name} ({tenant_id})")

    # 2. Suscripción cancelada o terminada
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        customer_id = subscription.get('customer')
        
        # Buscar al tenant por su stripe_customer_id
        statement = select(Tenant).where(Tenant.stripe_customer_id == customer_id)
        tenant = db.exec(statement).first()
        
        if tenant:
            tenant.is_locked = True
            db.add(tenant)
            db.commit()
            print(f"🔒 [WEBHOOK] Suscripción cancelada. Negocio bloqueado: {tenant.name}")
        
    return {"status": "success"}

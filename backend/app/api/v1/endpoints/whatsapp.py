from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlmodel import Session
from uuid import UUID
from app.db import get_session
from app.models.base import Tenant
from app.services.whatsapp_service import WhatsAppService
from app.core.security import jwt, settings

router = APIRouter()

def get_tenant_id_from_token(token: Optional[str]) -> str:
    if not token:
        raise HTTPException(status_code=401, detail="Token requerido")
    try:
        payload = jwt.decode(token.replace("Bearer ", ""), settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("tenant_id")
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")

@router.get("/qr")
async def get_whatsapp_qr(token: Optional[str] = Header(None), session: Session = Depends(get_session)):
    tenant_id = get_tenant_id_from_token(token)
    tenant = session.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant no encontrado")

    # Usamos el tenant_id como nombre de instancia para asegurar unicidad
    instance_name = f"tenant_{str(tenant.id).replace('-', '_')}"
    
    # Intentamos obtener status para ver si ya existe
    status = WhatsAppService.get_status(instance_name)
    
    if status == "CONNECTED":
        return {"status": "CONNECTED", "message": "Ya estás vinculado"}

    # Si no está conectado, intentamos crear instance o resetear
    # Evolution suele devolver el QR al crear si no existe, o podemos pedirlo connect
    qr_base64 = WhatsAppService.get_qr_code(instance_name)
    
    if not qr_base64:
        # Si falla connect, intentamos create
        create_res = WhatsAppService.create_instance(instance_name)
        if create_res:
            qr_base64 = create_res.get("qrcode", {}).get("base64")
        
    if not qr_base64:
        raise HTTPException(status_code=500, detail="No se pudo generar el código QR")

    # Guardamos el instance_id en el tenant si no lo tiene
    if tenant.whatsapp_instance_id != instance_name:
        tenant.whatsapp_instance_id = instance_name
        session.add(tenant)
        session.commit()

    return {"status": "QR_READY", "qrcode": qr_base64}

@router.get("/pairing-code")
async def get_whatsapp_pairing_code(number: str, token: Optional[str] = Header(None), session: Session = Depends(get_session)):
    tenant_id = get_tenant_id_from_token(token)
    tenant = session.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant no encontrado")

    instance_name = f"tenant_{str(tenant.id).replace('-', '_')}"
    
    # Aseguramos que la instancia exista
    status = WhatsAppService.get_status(instance_name)
    if status == "CONNECTED":
        return {"status": "CONNECTED", "message": "Ya estás vinculado"}
    
    if status == "DISCONNECTED" or status == "ERROR":
         # Intentamos crearla si no existe
         WhatsAppService.create_instance(instance_name)

    pairing_code = WhatsAppService.get_pairing_code(instance_name, number)
    
    if not pairing_code:
        raise HTTPException(status_code=500, detail="No se pudo generar el código de emparejamiento")

    # Guardamos el instance_id y el teléfono en el tenant
    tenant.whatsapp_instance_id = instance_name
    tenant.whatsapp_phone = number
    session.add(tenant)
    session.commit()

    return {"status": "PAIRING_CODE_READY", "code": pairing_code}

@router.get("/status")
async def check_whatsapp_status(token: Optional[str] = Header(None), session: Session = Depends(get_session)):
    tenant_id = get_tenant_id_from_token(token)
    tenant = session.get(Tenant, tenant_id)
    if not tenant or not tenant.whatsapp_instance_id:
        return {"status": "DISCONNECTED"}

    status = WhatsAppService.get_status(tenant.whatsapp_instance_id)
    return {"status": status}

@router.post("/logout")
async def logout_whatsapp(token: Optional[str] = Header(None), session: Session = Depends(get_session)):
    tenant_id = get_tenant_id_from_token(token)
    tenant = session.get(Tenant, tenant_id)
    if not tenant or not tenant.whatsapp_instance_id:
        return {"message": "No hay sesión activa"}

    success = WhatsAppService.logout(tenant.whatsapp_instance_id)
    if success:
        return {"message": "Sesión cerrada correctamente"}
    else:
        raise HTTPException(status_code=500, detail="Error al cerrar sesión")

from fastapi import FastAPI, Depends, HTTPException
import logging
import sys

# IMPRESIÓN INMEDIATA PARA DIAGNÓSTICO
print(">>> [MAIN.PY] CARGANDO MÓDULO MAIN...", file=sys.stderr)

from app.core.config import settings
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai_service import AIService
from app.services.notification_service import NotificationService
from app.db import init_db, get_session
from app.models.base import Tenant, Customer, Booking, ChatMessage, User
from datetime import datetime, timedelta
import json
import os
import traceback

# CONFIGURACIÓN DE ENTORNO
IS_VERCEL = os.getenv("VERCEL") == "1"
STATIC_DIR = "/tmp" if IS_VERCEL else "static"

from sqlmodel import Session, select

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import Request
from fastapi.responses import JSONResponse

from app.api.v1.endpoints import auth, payments, data

def get_db():
    from app.db import get_session
    yield from get_session()

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME)
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["payments"])
app.include_router(data.router, prefix="/api/v1/data", tags=["data"])

# Configuración de CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://localhost:5173", # Vite default
]

if settings.FRONTEND_URL and settings.FRONTEND_URL != "*":
    # Asegurarnos de limpiar espacios o barras finales
    clean_frontend_url = settings.FRONTEND_URL.strip().rstrip("/")
    if clean_frontend_url not in origins:
        origins.append(clean_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if settings.FRONTEND_URL != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Manejador de excepciones global para diagnóstico rápido en producción
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    error_detail = traceback.format_exc()
    print(f"CRITICAL ERROR: {error_detail}", file=sys.stderr)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal Server Error",
            "error": str(exc),
            "diagnostics": error_detail if not IS_VERCEL else "Ver logs en el panel de control."
        }
    )

# Configuración de archivos estáticos (Compatibilidad con Vercel)
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.on_event("startup")
def on_startup():
    print("STARTUP: Running NexoBot initialization...", file=sys.stderr)
    try:
        # Intentamos inicializar pero capturamos el error para no matar el proceso 
        init_db()
        print("STARTUP: Database initialized successfully!", file=sys.stderr)
    except Exception as e:
        print("STARTUP ERROR: The database failed but we will keep the server LIVE for diagnosis.", file=sys.stderr)
        print(f"ERROR DETAIL: {str(e)}", file=sys.stderr)

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}

@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, raw_request: Request, session: Session = Depends(get_db)):
    # 1. Buscar el Negocio (Tenant)
    
    tenant = session.get(Tenant, request.tenant_id)
    
    # Obtener Bookings (Reservas) actuales para saber disponibilidad
    bookings = session.exec(select(Booking).where(Booking.tenant_id == request.tenant_id)).all()
    bookings_str = json.dumps([{
        "property": b.property_name,
        "from": b.start_date.strftime("%Y-%m-%d"),
        "to": b.end_date.strftime("%Y-%m-%d"),
        "status": b.status
    } for b in bookings])

    tenant_context = {
        "name": tenant.name if tenant else "NexoBot Demo",
        "industry": request.industry_override if request.industry_override else (tenant.industry if tenant else "general"),
        "main_interest": tenant.main_interest if tenant else "General",
        "language": request.language or "es",
        "catalog": tenant.services if tenant else "[]",
        "schedule": tenant.business_hours if tenant else "{}",
        "current_bookings": bookings_str
    }
    
    # 2. Recuperar contexto del cliente (RAG)
    customer_info = ""
    if request.customer_id:
        customer = session.get(Customer, request.customer_id)
        if customer:
            customer_info = f"Info Cliente: {customer.preferences}. Historial: Recientemente agendó un servicio."
    
    # 3. Procesar con Gemini
    full_query = f"{customer_info}\n\nMensaje del usuario: {request.message}"
    
    # PEQUEÑO TRUCO: Si el mensaje empieza por "Confirmo mi cita", forzamos el contexto de reserva
    if "Confirmo mi cita" in request.message:
        full_query = f"EL USUARIO ESTÁ CONFIRMANDO LOS DATOS FINALES DE SU CITA. POR FAVOR, EXTRAE LAS ENTIDADES Y DEVUELVE INTENT 'book_appointment'.\n\n{full_query}"

    ai_output_raw = AIService.process_natural_language(full_query, tenant_context)
    
    # Limpiar posibles bloques de markdown si Gemini los incluye
    clean_output = ai_output_raw.strip()
    if clean_output.startswith("```json"):
        clean_output = clean_output.replace("```json", "", 1).replace("```", "", 1).strip()
    elif clean_output.startswith("```"):
        clean_output = clean_output.replace("```", "", 1).replace("```", "", 1).strip()

    try:
        ai_output = json.loads(clean_output)
        if not isinstance(ai_output, dict):
            ai_output = {"intent": "chat", "response_text": str(ai_output), "entities": {}}
    except Exception:
        # Fallback si Gemini no devuelve JSON puro
        ai_output = {"intent": "chat", "response_text": clean_output, "entities": {}}
    
    # Lógica específica para Generación de Documentos y Notificaciones
    download_url = None
    entities = ai_output.get('entities', {})
    if not isinstance(entities, dict):
        entities = {}
    intent = ai_output.get('intent')
    
    print(f">>> [CHAT] Intent detectado: {intent}, Entidades: {entities}")

    # 4. Guardar historial en la Base de Datos para que el dueño lo vea "interno"
    try:
        # Guardar mensaje del usuario
        user_chat = ChatMessage(
            tenant_id=request.tenant_id,
            role="user",
            content=request.message,
            customer_name=entities.get('cliente') or "Público"
        )
        # Guardar respuesta del bot
        bot_chat = ChatMessage(
            tenant_id=request.tenant_id,
            role="assistant",
            content=ai_output.get('response_text', ""),
            intent=intent
        )
        session.add(user_chat)
        session.add(bot_chat)
        session.commit()
    except Exception as e:
        print(f"Error guardando historial de chat: {e}")

    # 5. Notificaciones al Celular/WhatsApp y Email del dueño
    if tenant:
        # Buscar el email del dueño (primer usuario del tenant)
        admin_user = tenant.users[0] if tenant.users else None
        admin_email = admin_user.email if admin_user else None
        
        # Fallback: Si no hay usuarios vinculados, intentar buscar por tenant_id en la tabla User
        if not admin_email:
            fallback_user = session.exec(select(User).where(User.tenant_id == tenant.id)).first()
            if fallback_user:
                admin_email = fallback_user.email

        tenant_phone = tenant.phone
        print(f">>> [CHAT] Notificando a: Email={admin_email}, Tel={tenant_phone}")
        
        # Alerta general por cada mensaje (si está habilitado)
        if tenant.whatsapp_notifications_enabled:
            customer_display_name = entities.get('cliente') or "Usuario"
            if request.customer_id:
                cust = session.get(Customer, request.customer_id)
                if cust:
                    customer_display_name = cust.full_name
            
            # Solo notificar si tenemos algún medio de contacto definido
            if tenant_phone or admin_email:
                print(f">>> [CHAT] Enviando notificación de mensaje...")
                NotificationService.notify_chat_message(
                    tenant.name, tenant_phone or "No configurado", admin_email, customer_display_name, request.message
                )

        if intent == "book_appointment":
            # Determinamos el nombre del cliente para la notificación
            customer_display_name = entities.get('cliente') or "Usuario"
            
            # Lógica para guardar la reserva en la base de datos (si aplica)
            try:
                # Extraer fechas de las entidades de la IA
                start_date_str = entities.get('fecha_entrada') or entities.get('fecha')
                # Si no hay fecha de salida, asumimos 1 hora después (para servicios como peluquería)
                end_date_str = entities.get('fecha_salida')
                
                if start_date_str:
                    try:
                        # Limpieza y fallback para fechas
                        if isinstance(start_date_str, str):
                            start_date_str = start_date_str.replace('Z', '').replace(' ', 'T')
                        
                        try:
                            start_dt = datetime.fromisoformat(start_date_str)
                        except ValueError:
                            # Si falla, intentar parsear solo la fecha o asumir hoy si es 'mañana'
                            if 'mañana' in start_date_str.lower():
                                start_dt = datetime.now() + timedelta(days=1)
                                start_dt = start_dt.replace(hour=10, minute=0, second=0, microsecond=0)
                            else:
                                start_dt = datetime.now() + timedelta(hours=2) # Fallback

                        if end_date_str:
                            try:
                                end_dt = datetime.fromisoformat(end_date_str.replace('Z', '').replace(' ', 'T'))
                            except ValueError:
                                end_dt = start_dt + timedelta(hours=1)
                        else:
                            end_dt = start_dt + timedelta(hours=1)
                            
                        new_booking = Booking(
                            tenant_id=tenant.id,
                            property_name=entities.get('propiedad', 'Servicio General'),
                            customer_id=request.customer_id,
                            start_date=start_dt,
                            end_date=end_dt,
                            status="confirmed",
                            total_price=float(entities.get('monto', 0)),
                            notes=f"Cita/Reserva creada por NexoBot. Datos: {entities.get('telefono', 'N/A')} {entities.get('direccion', 'N/A')}"
                        )
                        session.add(new_booking)
                        session.commit()
                        print(f">>> [CHAT] Cita guardada con éxito")
                    except Exception as e:
                        print(f"Error parsing date or saving booking: {e}")
                        # Fallback: intentar notificar aunque falle el guardado en BD para no perder el cliente
                        if tenant.whatsapp_notifications_enabled:
                             NotificationService.notify_appointment(
                                tenant.name, tenant_phone, admin_email, customer_display_name, entities
                            )
            except Exception as e:
                print(f"Error guardando reserva: {e}")

            if tenant.whatsapp_notifications_enabled:
                NotificationService.notify_appointment(
                    tenant.name, tenant_phone, admin_email, customer_display_name, entities
                )
        elif intent in ["generate_invoice", "generate_contract", "generate_summary"]:
            if tenant.whatsapp_notifications_enabled:
                NotificationService.notify_request(
                    tenant.name, tenant_phone, admin_email, customer_display_name, intent.replace("generate_", "").capitalize()
                )
        elif intent == "support_escalation":
            if tenant.whatsapp_notifications_enabled:
                NotificationService.notify_support_issue(
                    tenant.name, tenant_phone, admin_email, customer_display_name, entities.get('problema', 'Problema no especificado')
                )

    if intent == "generate_contract":
        filename = AIService.generate_contract_pdf(entities, tenant_context['name'])
        download_url = f"{raw_request.base_url}static/{filename}"
    if intent == "generate_invoice":
        filename = AIService.generate_invoice_pdf(entities, tenant_context['name'])
        download_url = f"{raw_request.base_url}static/{filename}"
        # Lógica de Inventario: Descontar stock
        if tenant:
            try:
                services = json.loads(tenant.services)
                product_name = entities.get('servicios', '').lower()
                for svc in services:
                    if svc['name'].lower() in product_name or product_name in svc['name'].lower():
                        current_stock = int(svc.get('stock', 0))
                        if current_stock > 0:
                            new_stock = current_stock - 1
                            svc['stock'] = str(new_stock)
                            
                            # Alerta de Stock Bajo (<= 3 unidades)
                            if new_stock <= 3:
                                admin_user = tenant.users[0] if tenant.users else None
                                admin_email = admin_user.email if admin_user else None
                                if tenant.whatsapp_notifications_enabled:
                                    NotificationService.notify_low_stock(
                                        tenant.name, tenant.phone, admin_email, svc['name'], new_stock
                                    )
                            break
                tenant.services = json.dumps(services)
                session.add(tenant)
                session.commit()
            except Exception as e:
                print(f"Error actualizando inventario: {e}")
    elif intent == "generate_summary":
        filename = AIService.generate_summary_pdf(entities, tenant_context['name'])
        download_url = f"{raw_request.base_url}static/{filename}"

    if download_url:
        ai_output['response_text'] = f"{ai_output.get('response_text')} ¡He generado el documento! Puedes descárgalo aquí: {download_url}"

    return ChatResponse(
        response=ai_output.get('response_text', "Lo siento, no pude procesar eso."),
        intent=intent or 'chat',
        action_required=intent in ["create_invoice", "book_appointment", "generate_contract", "generate_invoice", "generate_summary", "collect_data"],
        metadata={**entities, "download_url": download_url} if download_url else entities
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

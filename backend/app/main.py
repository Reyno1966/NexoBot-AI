from fastapi import FastAPI, Depends, HTTPException
import logging
import sys

# IMPRESIÓN INMEDIATA PARA DIAGNÓSTICO
print(">>> [MAIN.PY] CARGANDO MÓDULO MAIN...", file=sys.stderr)

from app.core.config import settings
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai_service import AIService
import json

# Deferimos los imports de BD para debugging
# from app.db import init_db, get_session
from sqlmodel import Session

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.api.v1.endpoints import auth, payments

def get_db():
    from app.db import get_session
    yield from get_session()

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME)
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["payments"])

# Configuración de CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    settings.FRONTEND_URL,
]

# Si settings.FRONTEND_URL no es *, lo añadimos. Si es *, permitimos todo.
if settings.FRONTEND_URL == "*":
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Manejador de excepciones global para diagnóstico rápido en producción
from fastapi.responses import JSONResponse
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    import traceback
    error_detail = traceback.format_exc()
    print(f"CRITICAL ERROR: {error_detail}", file=sys.stderr)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal Server Error",
            "error": str(exc),
            "diagnostics": error_detail if not IS_VERCEL else "Check logs"
        }
    )

# Configuración de archivos estáticos (Compatibilidad con Vercel)
# Vercel tiene un sistema de archivos de solo lectura, excepto /tmp
IS_VERCEL = os.getenv("VERCEL") == "1"
STATIC_DIR = "/tmp" if IS_VERCEL else "static"

if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.on_event("startup")
def on_startup():
    import sys
    import traceback
    print("STARTUP: Running NexoBot initialization...", file=sys.stderr)
    try:
        from app.db import init_db
        # Intentamos inicializar pero capturamos el error para no matar el proceso STATUS 3
        init_db()
        print("STARTUP: Database initialized successfully!", file=sys.stderr)
    except Exception as e:
        print("STARTUP ERROR: The database failed but we will keep the server LIVE for diagnosis.", file=sys.stderr)
        print(f"ERROR DETAIL: {str(e)}", file=sys.stderr)
        # traceback.print_exc() 
        # NOTA: No hacemos raise e para evitar el estado 3 inmediato por ahora

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}

from fastapi import Request

@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, raw_request: Request, session: Session = Depends(get_db)):
    # 1. Buscar el Negocio (Tenant)
    from app.models.base import Tenant, Customer
    from sqlmodel import select
    
    tenant = session.get(Tenant, request.tenant_id)
    
    tenant_context = {
        "name": tenant.name if tenant else "NexoBot Demo",
        "industry": request.industry_override if request.industry_override else (tenant.industry if tenant else "general"),
        "main_interest": tenant.main_interest if tenant else "General",
        "language": request.language or "es",
        "catalog": tenant.services if tenant else "[]"
    }
    
    # 2. Recuperar contexto del cliente (RAG)
    customer_info = ""
    if request.customer_id:
        customer = session.get(Customer, request.customer_id)
        if customer:
            customer_info = f"Info Cliente: {customer.preferences}. Historial: Recientemente agendó un servicio."
    
    # 3. Procesar con Gemini
    full_query = f"{customer_info}\n\nMensaje del usuario: {request.message}"
    ai_output_raw = AIService.process_natural_language(full_query, tenant_context)
    
    # Limpiar posibles bloques de markdown si Gemini los incluye
    clean_output = ai_output_raw.strip()
    if clean_output.startswith("```json"):
        clean_output = clean_output.replace("```json", "", 1).replace("```", "", 1).strip()
    elif clean_output.startswith("```"):
        clean_output = clean_output.replace("```", "", 1).replace("```", "", 1).strip()

    try:
        ai_output = json.loads(clean_output)
    except Exception:
        # Fallback si Gemini no devuelve JSON puro
        ai_output = {"intent": "chat", "response_text": clean_output, "entities": {}}
    
    # Lógica específica para Generación de Documentos y Notificaciones
    from app.services.notification_service import NotificationService
    
    download_url = None
    entities = ai_output.get('entities', {})
    intent = ai_output.get('intent')
    
    # Notificaciones al Celular/WhatsApp y Email del dueño
    if tenant:
        admin_user = tenant.users[0] if tenant.users else None
        admin_email = admin_user.email if admin_user else None
        tenant_phone = tenant.phone

        if intent == "book_appointment":
            NotificationService.notify_appointment(
                tenant.name, tenant_phone, admin_email, entities.get('cliente', 'Usuario'), entities
            )
        elif intent in ["generate_invoice", "generate_contract", "generate_summary"]:
            NotificationService.notify_request(
                tenant.name, tenant_phone, admin_email, entities.get('cliente', 'Usuario'), intent.replace("generate_", "").capitalize()
            )
        elif intent == "support_escalation":
            NotificationService.notify_support_issue(
                tenant.name, tenant_phone, admin_email, entities.get('cliente', 'Usuario'), entities.get('problema', 'Problema no especificado')
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
        action_required=intent in ["create_invoice", "book_appointment", "generate_contract", "generate_invoice", "generate_summary"],
        metadata={**entities, "download_url": download_url} if download_url else entities
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

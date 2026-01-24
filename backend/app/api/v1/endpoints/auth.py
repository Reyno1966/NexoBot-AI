import sys
from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import timedelta
from app.db import get_session
from app.models.base import User, Tenant
from app.core.security import get_password_hash, verify_password, create_access_token
from app.schemas.auth import UserCreate, Token, UserResponse, TenantRead
from app.core.config import settings

def get_db():
    from app.db import get_session
    yield from get_session()

from uuid import UUID
from app.schemas.auth import (
    UserCreate, Token, UserResponse, TenantRead, 
    ForgotPasswordRequest, ResetPasswordRequest
)
from app.services.notification_service import NotificationService
router = APIRouter()

@router.get("/public/tenant/{tenant_id}", response_model=TenantRead)
def get_public_tenant_info(tenant_id: UUID, session: Session = Depends(get_db)):
    tenant = session.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")
    return tenant

@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    session: Session = Depends(get_db),
    token: str = Header(...)
):
    try:
        from app.core.security import jwt, settings
        payload = jwt.decode(token.replace("Bearer ", ""), settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        user = session.exec(select(User).where(User.email == email)).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Sesión inválida")

@router.get("/status")
def get_auth_status(session: Session = Depends(get_db)):
    # Este endpoint ayudará a mostrar los días restantes
    return {"status": "active"} # Simplificado por ahora

@router.post("/register", response_model=UserResponse)
def register_user(user_in: UserCreate, session: Session = Depends(get_db)):
    print(f">>> [AUTH] Iniciando registro para: {user_in.email}", file=sys.stderr)
    # Verificar si el usuario ya existe
    existing_user = session.exec(select(User).where(User.email == user_in.email)).first()
    if existing_user:
        print(f">>> [AUTH] Error: Correo {user_in.email} ya existe", file=sys.stderr)
        raise HTTPException(status_code=400, detail="El correo ya está registrado.")
    
    try:
        # Crear un Tenant (Negocio) con los datos elegidos
        print(f">>> [AUTH] Creando Tenant para {user_in.industry}...", file=sys.stderr)
        new_tenant = Tenant(
            name=f"Negocio de {user_in.email.split('@')[0]}",
            industry=user_in.industry,
            phone=user_in.phone,
            address=user_in.address,
            country=user_in.country,
            main_interest=user_in.main_interest,
            is_locked=True 
        )
        session.add(new_tenant)
        session.commit()
        session.refresh(new_tenant)
        print(f">>> [AUTH] Tenant creado con ID: {new_tenant.id}", file=sys.stderr)

        # Crear el usuario
        print(f">>> [AUTH] Creando Usuario...", file=sys.stderr)
        new_user = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            tenant_id=new_tenant.id
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        print(f">>> [AUTH] Registro completado con éxito para {user_in.email}", file=sys.stderr)
        
        return new_user
    except Exception as e:
        session.rollback()
        print(f">>> [AUTH] ERROR CRITICAL EN REGISTRO: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error interno al crear la cuenta: {str(e)}")

@router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_db)
):
    user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "tenant_id": str(user.tenant_id)},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, session: Session = Depends(get_db)):
    user = session.exec(select(User).where(User.email == request.email)).first()
    
    # Por seguridad, no revelamos si el correo existe o no
    if not user:
        return {"message": "Si el correo está registrado, recibirás las instrucciones en breve."}
    
    # Generar un token temporal de recuperación (reutilizamos la lógica de JWT por simplificar)
    recovery_token = create_access_token(
        data={"sub": user.email, "type": "recovery"},
        expires_delta=timedelta(hours=1)
    )
    
    # Intentar obtener la URL del frontend de la configuración o del origen de la petición
    frontend_base = settings.FRONTEND_URL
    if frontend_base == "*":
        # Fallback para desarrollo: asumimos localhost si no está configurado
        frontend_base = "http://localhost:3000"
    
    reset_link = f"{frontend_base}/reset-password?token={recovery_token}"
    
    html_msg = f"""
    <div style="font-family: sans-serif; background: #0f1115; color: white; padding: 40px; border-radius: 20px;">
        <h2 style="color: #2db5b9;">🔑 Recuperación de Contraseña</h2>
        <p>Has solicitado restablecer tu contraseña en <b>NexoBot AI</b>.</p>
        <p>Haz clic en el siguiente botón para continuar (válido por 1 hora):</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_link}" style="background: #2db5b9; color: white; padding: 15px 25px; border-radius: 12px; text-decoration: none; font-weight: bold;">Restablecer Contraseña</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #1a1f24; margin: 20px 0;">
        <p style="font-size: 12px; color: #64748b;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
    </div>
    """
    
    NotificationService.send_email_alert(user.email, "🔑 Recuperación de Contraseña - NexoBot AI", html_msg)
    
    return {"message": "Si el correo está registrado, recibirás las instrucciones en breve."}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, session: Session = Depends(get_db)):
    try:
        from app.core.security import jwt, settings
        payload = jwt.decode(request.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        if payload.get("type") != "recovery":
            raise HTTPException(status_code=400, detail="Token no válido")
            
        email = payload.get("sub")
        user = session.exec(select(User).where(User.email == email)).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
            
        user.hashed_password = get_password_hash(request.new_password)
        session.add(user)
        session.commit()
        
        return {"message": "Contraseña actualizada con éxito"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail="El enlace ha expirado o es inválido")

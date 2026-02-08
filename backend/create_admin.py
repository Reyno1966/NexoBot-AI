from sqlmodel import Session, select
from app.db import get_db_engine, init_db
from app.models.base import Tenant, User
from app.core.security import get_password_hash
import uuid

def create_admin_user():
    print("🔑 Creando usuario de rescate...")
    
    # Asegurar que la DB existe
    init_db()
    
    engine = get_db_engine()
    with Session(engine) as session:
        # 1. Buscar o Crear Tenant por defecto
        tenant = session.exec(select(Tenant).where(Tenant.name == "NexoBot Admin")).first()
        if not tenant:
            tenant = Tenant(
                name="NexoBot Admin",
                industry="Tech",
                main_interest="Admin"
            )
            session.add(tenant)
            session.commit()
            session.refresh(tenant)
            print(f"✅ Tenant Admin creado: {tenant.id}")
        
        # 2. Crear Usuario Admin
        email = "admin@nexobot.com"
        password = "admin123"
        hashed_pwd = get_password_hash(password)
        
        existing_user = session.exec(select(User).where(User.email == email)).first()
        if existing_user:
            # Si existe, actualizamos la password para estar seguros
            existing_user.hashed_password = hashed_pwd
            existing_user.tenant_id = tenant.id
            existing_user.is_active = True
            existing_user.is_admin = True
            session.add(existing_user)
            print("🔄 Usuario actualizado con nueva contraseña.")
        else:
            new_user = User(
                email=email,
                hashed_password=hashed_pwd,
                is_active=True,
                is_admin=True,
                tenant_id=tenant.id
            )
            session.add(new_user)
            print("✨ Usuario creado.")
        
        session.commit()
        print(f"\n🚀 ¡LISTO! Credenciales de acceso:\nUsuario: {email}\nPassword: {password}\n")

if __name__ == "__main__":
    create_admin_user()

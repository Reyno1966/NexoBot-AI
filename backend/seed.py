from sqlmodel import Session, select
from app.db import get_db_engine, init_db
from app.models.base import Tenant, Customer
import uuid

def seed_data():
    print("🌱 Iniciando siembra de datos...")
    init_db()
    
    engine = get_db_engine()
    with Session(engine) as session:
        # 1. Crear un Inquilino (Negocio) de prueba
        existing_tenant = session.exec(select(Tenant).where(Tenant.name == "Barbería Estilo")).first()
        if not existing_tenant:
            tenant = Tenant(
                name="Barbería Estilo",
                industry="Beauty"
            )
            session.add(tenant)
            session.commit()
            session.refresh(tenant)
            print(f"✅ Negocio creado ID: {tenant.id}")
        else:
            tenant = existing_tenant
            print(f"ℹ️ El negocio ya existe ID: {tenant.id}")

        # 2. Crear un Cliente de prueba para ese negocio
        existing_customer = session.exec(select(Customer).where(Customer.full_name == "Juan Pérez")).first()
        if not existing_customer:
            customer = Customer(
                tenant_id=tenant.id,
                full_name="Juan Pérez",
                phone="+34 600 000 000",
                email="juan@example.com",
                preferences="Le gusta el corte degradado bajo y café solo."
            )
            session.add(customer)
            session.commit()
            print(f"✅ Cliente creado ID: {customer.id}")
        else:
            print(f"ℹ️ El cliente ya existe ID: {existing_customer.id}")

    print("🚀 Datos sembrados correctamente.")

if __name__ == "__main__":
    seed_data()

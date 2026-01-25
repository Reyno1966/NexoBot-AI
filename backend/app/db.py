import sys
import os

# IMPRESIÓN INMEDIATA PARA DIAGNÓSTICO
print(">>> [DB.PY] CARGANDO MÓDULO DB...", file=sys.stderr)

from sqlmodel import create_engine, SQLModel, Session
from app.core.config import settings
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from urllib.parse import urlparse, urlunparse, quote_plus

def get_engine():
    raw_url = settings.DATABASE_URL or os.getenv("DATABASE_URL")
    if not raw_url:
        print(">>> [DB.PY] ADVERTENCIA: DATABASE_URL no configurada. Usando SQLite temporal.", file=sys.stderr)
        db_url = "sqlite:///./database.db"
    else:
        db_url = raw_url.strip().replace('"', '').replace("'", "")
    
    # Automatización: Si es Supabase y usa puerto 5432, advertir sobre el Pooler (6543)
    if "supabase.co" in db_url and ":5432" in db_url:
        print(">>> [DB.PY] AVISO: Detectada URL de Supabase en puerto 5432. Si falla, usa el puerto 6543 (Transaction Pooler).", file=sys.stderr)

    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    try:
        if "://" in db_url and "@" in db_url:
            protocol, rest = db_url.split("://", 1)
            if protocol != "sqlite":
                auth_part, host_part = rest.rsplit("@", 1)
                if ":" in auth_part:
                    user, password = auth_part.split(":", 1)
                    if "%" not in password:
                        safe_password = quote_plus(password)
                        db_url = f"{protocol}://{user}:{safe_password}@{host_part}"
    except Exception as e:
        print(f">>> [DB.PY] Error procesando URL: {e}", file=sys.stderr)

    masked_url = db_url.split("@")[-1] if "@" in db_url else db_url
    print(f">>> [DB.PY] CONECTANDO A: ...@{masked_url}", file=sys.stderr)
    
    # Aumentamos el timeout y el pool_size para mayor estabilidad
    return create_engine(
        db_url, 
        echo=False, 
        pool_pre_ping=True,
        pool_recycle=300,
        connect_args={"connect_timeout": 10} if "sqlite" not in db_url else {}
    )

_engine = None

def get_db_engine():
    global _engine
    if _engine is None:
        _engine = get_engine()
    return _engine

def init_db():
    print(">>> [DB.PY] INICIANDO VALIDACIÓN DE BASE DE DATOS...", file=sys.stderr)
    try:
        engine = get_db_engine()
        # Test de conexión rápido antes de crear tablas
        with engine.connect() as conn:
            print(">>> [DB.PY] CONEXIÓN EXITOSA CON EL SERVIDOR", file=sys.stderr)
        
        SQLModel.metadata.create_all(engine)
        
        # Parche manual para columnas nuevas si la tabla ya existía
        with engine.begin() as conn:
            from sqlalchemy import text
            print(">>> [DB.PY] APLICANDO PARCHES DE ESQUEMA (SI SON NECESARIOS)...", file=sys.stderr)
            conn.execute(text("ALTER TABLE tenant ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR;"))
            conn.execute(text("ALTER TABLE tenant ADD COLUMN IF NOT EXISTS industry VARCHAR;"))
            conn.execute(text("ALTER TABLE tenant ADD COLUMN IF NOT EXISTS phone VARCHAR;"))
            conn.execute(text("ALTER TABLE tenant ADD COLUMN IF NOT EXISTS address VARCHAR;"))
            conn.execute(text("ALTER TABLE tenant ADD COLUMN IF NOT EXISTS country VARCHAR;"))
            conn.execute(text("ALTER TABLE tenant ADD COLUMN IF NOT EXISTS main_interest VARCHAR;"))
            conn.execute(text("ALTER TABLE tenant ADD COLUMN IF NOT EXISTS business_hours VARCHAR;"))
            conn.execute(text("ALTER TABLE tenant ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;"))
            
            # Asegurar tabla de bookings si no se creó con create_all
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS booking (
                    id UUID PRIMARY KEY,
                    tenant_id UUID NOT NULL,
                    property_name VARCHAR NOT NULL,
                    customer_id UUID,
                    start_date TIMESTAMP NOT NULL,
                    end_date TIMESTAMP NOT NULL,
                    status VARCHAR DEFAULT 'confirmed',
                    total_price FLOAT DEFAULT 0.0,
                    notes VARCHAR,
                    created_at TIMESTAMP,
                    updated_at TIMESTAMP
                );
            """))
            
        print(">>> [DB.PY] TABLAS Y ESQUEMA SINCRONIZADOS CORRECTAMENTE", file=sys.stderr)
    except Exception as e:
        print(f">>> [DB.PY] ERROR DE CONEXIÓN: {str(e)}", file=sys.stderr)
        print(">>> [DB.PY] TIP: Si el error es 'Network is unreachable', verifica que estés usando el puerto 6543 de Supabase.", file=sys.stderr)
        # No bloqueamos el inicio del servidor para permitir diagnóstico vía API
        pass

def get_session():
    engine = get_db_engine()
    with Session(engine) as session:
        yield session

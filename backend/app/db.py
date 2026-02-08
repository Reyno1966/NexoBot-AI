import sys
import os
import logging
from urllib.parse import quote_plus

# IMPRESIÓN INMEDIATA PARA DIAGNÓSTICO
print(">>> [DB.PY] CARGANDO MÓDULO DB... INICIANDO...", file=sys.stderr)

from sqlmodel import create_engine, SQLModel, Session
from app.core.config import settings

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_database_url():
    """
    Intenta obtener la URL de la base de datos de todas las formas posibles.
    Prioridad:
    1. Variable DATABASE_URL explícita.
    2. Variables desglosadas de Railway (PGHOST, PGUSER, etc).
    3. SQLite local (fallback).
    """
    # 1. Intentar DATABASE_URL directa
    url = os.getenv("DATABASE_URL") or settings.DATABASE_URL
    
    # 2. Si no hay URL, intentar construirla con variables de Railway
    if not url:
        print(">>> [DB.PY] DATABASE_URL no encontrada. Buscando variables PG*...", file=sys.stderr)
        pg_user = os.getenv("PGUSER")
        pg_pass = os.getenv("PGPASSWORD")
        pg_host = os.getenv("PGHOST")
        pg_port = os.getenv("PGPORT")
        pg_db = os.getenv("PGDATABASE")
        
        if pg_user and pg_host and pg_db:
            print(">>> [DB.PY] Variables PG encontradas. Construyendo URL...", file=sys.stderr)
            # Codificar contraseña por si tiene caracteres raros
            safe_pass = quote_plus(pg_pass) if pg_pass else ""
            url = f"postgresql://{pg_user}:{safe_pass}@{pg_host}:{pg_port}/{pg_db}"
        else:
            print(">>> [DB.PY] No se encontraron variables PG completas.", file=sys.stderr)

    # 3. Limpieza y corrección de URL
    if url:
        # Quitar comillas si las hay
        url = url.strip().replace('"', '').replace("'", "")
        # Corregir protocolo postgres:// -> postgresql://
        if url.startswith("postgres://"):
            print(">>> [DB.PY] AUTO-CORRECCIÓN: Cambiando 'postgres://' a 'postgresql://'", file=sys.stderr)
            url = url.replace("postgres://", "postgresql://", 1)
        return url
    
    # 4. Fallback a SQLite
    print(">>> [DB.PY] ADVERTENCIA CRÍTICA: Usando SQLite temporal (database.db).", file=sys.stderr)
    return "sqlite:///./database.db"

def get_engine():
    db_url = get_database_url()
    
    # Ocultar contraseña en logs
    masked_url = db_url
    if "@" in db_url:
        try:
            prefix = db_url.split("@")[1]
            masked_url = f"...@{prefix}"
        except:
            masked_url = "..."
            
    print(f">>> [DB.PY] CONECTANDO A: {masked_url}", file=sys.stderr)
    
    try:
        # Configuración específica según el tipo de DB
        if "sqlite" in db_url:
            return create_engine(
                db_url,
                connect_args={"check_same_thread": False}, # Necesario para SQLite en FastAPI
                pool_pre_ping=True
            )
        else:
            return create_engine(
                db_url,
                pool_pre_ping=True,
                pool_recycle=300,
                pool_size=10,
                max_overflow=20
            )
    except Exception as e:
        print(f">>> [DB.PY] ERROR FATAL CREANDO ENGINE: {str(e)}", file=sys.stderr)
        raise e

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
        # Test de conexión rápido
        with engine.connect() as conn:
            print(">>> [DB.PY] CONEXIÓN EXITOSA CON EL SERVIDOR", file=sys.stderr)
        
        # Crear tablas
        SQLModel.metadata.create_all(engine)
        print(">>> [DB.PY] TABLAS CREADAS/VERIFICADAS", file=sys.stderr)
        
        # Parches de esquema (columnas nuevas)
        # Envolvemos en try/except individual para que no falle todo si la columna ya existe
        with engine.begin() as conn:
            from sqlalchemy import text
            columns_to_add = [
                "stripe_customer_id VARCHAR",
                "stripe_public_key VARCHAR", 
                "stripe_secret_key VARCHAR",
                "industry VARCHAR",
                "phone VARCHAR",
                "address VARCHAR",
                "country VARCHAR",
                "main_interest VARCHAR",
                "business_hours VARCHAR",
                "is_locked BOOLEAN DEFAULT FALSE",
                "whatsapp_notifications_enabled BOOLEAN DEFAULT FALSE",
                "smtp_host VARCHAR",
                "smtp_port INTEGER",
                "smtp_user VARCHAR",
                "smtp_password VARCHAR",
                "whatsapp_api_key VARCHAR",
                "whatsapp_phone VARCHAR",
                "whatsapp_instance_id VARCHAR",
                "resend_api_key VARCHAR",
                "google_calendar_token VARCHAR",
                "primary_color VARCHAR DEFAULT '#6366f1'",
                "secondary_color VARCHAR DEFAULT '#22d3ee'"
            ]
            
            for col_def in columns_to_add:
                try:
                    # Syntax compatible con Postgres y SQLite
                    conn.execute(text(f"ALTER TABLE tenant ADD COLUMN IF NOT EXISTS {col_def};"))
                except Exception as ex:
                    # Ignoramos error si la columna ya existe (algunas DBs viejas no soportan IF NOT EXISTS)
                    print(f">>> [DB.PY] Aviso menor al añadir columna: {str(ex)}", file=sys.stderr)
            
            # Asegurar tabla booking
            try:
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
            except Exception as ex:
                print(f">>> [DB.PY] Aviso tabla booking: {str(ex)}", file=sys.stderr)
            
        print(">>> [DB.PY] ESQUEMA SINCRONIZADO CORRECTAMENTE", file=sys.stderr)
    except Exception as e:
        print(f">>> [DB.PY] ERROR EN INIT_DB (No fatal, la app seguirá intentando): {str(e)}", file=sys.stderr)

def get_session():
    engine = get_db_engine()
    with Session(engine) as session:
        yield session

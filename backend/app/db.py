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

def get_engine():
    raw_url = settings.DATABASE_URL or os.getenv("DATABASE_URL")
    print(f">>> [DB.PY] URL RAW RECIBIDA: {raw_url[:20]}...", file=sys.stderr)
    
    if not raw_url:
        print(">>> [DB.PY] CRITICAL: DATABASE_URL is not set!", file=sys.stderr)
        raise ValueError("DATABASE_URL is not set")

    # Limpieza agresiva (quitar espacios, comillas y saltos de línea)
    db_url = raw_url.strip().replace('"', '').replace("'", "")
    
    # Corregir prefijo de URL
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    # REPARADOR DE CONTRASEÑA: Escapa el '?' de forma manual y robusta
    if "@" in db_url:
        try:
            protocol_part, rest = db_url.split("://", 1)
            auth_part, host_part = rest.split("@", 1)
            if ":" in auth_part:
                user, password = auth_part.split(":", 1)
                if "?" in password:
                    print(">>> [DB.PY] Detectado '?' en password. Escapando...", file=sys.stderr)
                    password = password.replace("?", "%3F")
                db_url = f"{protocol_part}://{user}:{password}@{host_part}"
        except Exception as e:
            print(f">>> [DB.PY] Error procesando URL: {e}", file=sys.stderr)

    masked_url = db_url.split("@")[-1] if "@" in db_url else db_url
    print(f">>> [DB.PY] INTENTANDO CONECTAR A: ...@{masked_url}", file=sys.stderr)
    
    try:
        new_engine = create_engine(db_url, echo=True, pool_pre_ping=True)
        print(">>> [DB.PY] ENGINE CREADO!", file=sys.stderr)
        return new_engine
    except Exception as e:
        print(f">>> [DB.PY] CRITICAL FAIL en create_engine: {str(e)}", file=sys.stderr)
        raise e

# El motor se crea de forma diferida (Lacy initialization)
_engine = None

def get_db_engine():
    global _engine
    if _engine is None:
        _engine = get_engine()
    return _engine

def init_db():
    print(">>> [DB.PY] EJECUTANDO init_db()...", file=sys.stderr)
    try:
        engine = get_db_engine()
        SQLModel.metadata.create_all(engine)
        print(">>> [DB.PY] TABLAS CREADAS / VERIFICADAS CON ÉXITO", file=sys.stderr)
    except Exception as e:
        print(f">>> [DB.PY] DATABASE ERROR DURANTE init_db: {str(e)}", file=sys.stderr)
        raise e

def get_session():
    engine = get_db_engine()
    with Session(engine) as session:
        yield session

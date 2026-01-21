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
        # 1. Limpieza básica
        db_url = raw_url.strip().replace('"', '').replace("'", "")
    
    # 2. Corregir prefijo postgres:// -> postgresql://
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    # 3. Escapado profesional de la contraseña
    try:
        # Si la URL ya contiene @, sospechamos que tiene credenciales
        if "://" in db_url and "@" in db_url:
            protocol, rest = db_url.split("://", 1)
            # Solo procesamos si no es SQLite
            if protocol != "sqlite":
                auth_part, host_part = rest.rsplit("@", 1)
                if ":" in auth_part:
                    user, password = auth_part.split(":", 1)
                    # Solo escapamos si no parece estar ya escapado
                    if "%" not in password:
                        safe_password = quote_plus(password)
                        db_url = f"{protocol}://{user}:{safe_password}@{host_part}"
                        print(">>> [DB.PY] Contraseña pre-procesada y escapada", file=sys.stderr)
    except Exception as e:
        print(f">>> [DB.PY] Advertencia al procesar URL: {e}", file=sys.stderr)

    masked_url = db_url.split("@")[-1] if "@" in db_url else db_url
    print(f">>> [DB.PY] INTENTANDO CONECTAR A: ...@{masked_url}", file=sys.stderr)
    
    try:
        return create_engine(db_url, echo=True, pool_pre_ping=True)
    except Exception as e:
        print(f">>> [DB.PY] ERROR FATAL EN create_engine: {str(e)}", file=sys.stderr)
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

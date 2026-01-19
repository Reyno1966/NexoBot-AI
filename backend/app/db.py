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
    print(f">>> [DB.PY] URL RAW RECIBIDA (primeros 15): {raw_url[:15]}...", file=sys.stderr)
    
    if not raw_url:
        raise ValueError("DATABASE_URL is not set")

    # 1. Limpieza básica
    db_url = raw_url.strip().replace('"', '').replace("'", "")
    
    # 2. Corregir prefijo postgres:// -> postgresql://
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    # 3. Escapado profesional de la contraseña
    try:
        if "://" in db_url and "@" in db_url:
            scheme_part, remainder = db_url.split("://", 1)
            # El último '@' separa las credenciales del host
            creds_part, host_part = remainder.rsplit("@", 1)
            
            if ":" in creds_part:
                user, password = creds_part.split(":", 1)
                safe_password = quote_plus(password)
                db_url = f"{scheme_part}://{user}:{safe_password}@{host_part}"
                print(">>> [DB.PY] Contraseña pre-procesada y escapada", file=sys.stderr)
            else:
                # Caso sin password explicito o formato raro, usamos urlparse como fallback
                parsed = urlparse(db_url)
                if parsed.password:
                    safe_password = quote_plus(parsed.password)
                    new_netloc = f"{parsed.username}:{safe_password}@{parsed.hostname}"
                    if parsed.port: new_netloc += f":{parsed.port}"
                    db_url = urlunparse(parsed._replace(netloc=new_netloc))
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

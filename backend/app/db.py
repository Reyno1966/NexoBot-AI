import sys
from sqlmodel import create_engine, SQLModel, Session
from app.core.config import settings
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_engine():
    db_url = settings.DATABASE_URL
    if not db_url:
        print("CRITICAL: DATABASE_URL is not set!", file=sys.stderr)
        raise ValueError("DATABASE_URL is not set")

    # Corregir prefijo de URL si es necesario
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    # Log para diagnóstico (protegiendo la contraseña)
    masked_url = db_url.split("@")[-1] if "@" in db_url else db_url
    print(f"DEBUG: Attempting to connect to database at: ...@{masked_url}", file=sys.stderr)
    
    try:
        return create_engine(db_url, echo=True)
    except Exception as e:
        print(f"CRITICAL: Failed to create engine: {str(e)}", file=sys.stderr)
        raise e

_engine = None

def get_db_engine():
    global _engine
    if _engine is None:
        _engine = get_engine()
    return _engine

def init_db():
    try:
        engine = get_db_engine()
        # Esto crea las tablas en la base de datos si no existen
        SQLModel.metadata.create_all(engine)
        print("DATABASE: Tables created successfully", file=sys.stderr)
    except Exception as e:
        print(f"DATABASE ERROR: {str(e)}", file=sys.stderr)
        raise e

def get_session():
    engine = get_db_engine()
    with Session(engine) as session:
        yield session

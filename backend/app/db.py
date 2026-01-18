from sqlmodel import create_engine, SQLModel, Session
from app.core.config import settings

import logging

# Configurar logging básico
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Corregir prefijo de URL si es necesario (SQLAlchemy requiere postgresql://)
db_url = settings.DATABASE_URL
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Log para diagnóstico (protegiendo la contraseña)
if db_url:
    masked_url = db_url.split("@")[-1] if "@" in db_url else db_url
    logger.info(f"Conectando a base de datos: ...@{masked_url}")

engine = create_engine(db_url, echo=True)

def init_db():
    # Esto crea las tablas en la base de datos si no existen
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

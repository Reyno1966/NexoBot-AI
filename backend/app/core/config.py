from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

# Cargar .env explícitamente desde la raíz del backend
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_path = os.path.join(base_dir, ".env")
load_dotenv(env_path)

class Settings(BaseSettings):
    PROJECT_NAME: str = "NexoBot AI Business Assistant"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "6f9d2a8b3c5e7f1a4d9b0c2e8f7a6b5d4c1e9f0a8b7d6c5e4a3b2f1e0d9c8b7a")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # Database
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL", "sqlite:///./database.db")
    
    @property
    def clean_database_url(self) -> str:
        return self.DATABASE_URL.strip().replace('"', '').replace("'", "")
    
    # AI
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "TU_KEY_PERSONAL_AQUI")
    STRIPE_SECRET_KEY: Optional[str] = os.getenv("STRIPE_SECRET_KEY")
    STRIPE_WEBHOOK_SECRET: Optional[str] = os.getenv("STRIPE_WEBHOOK_SECRET")
    VECTOR_DB_URL: Optional[str] = os.getenv("VECTOR_DB_URL")
    BASE_URL: str = os.getenv("BASE_URL", "https://nexobot-ai-production-ca95.up.railway.app")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "*") 

    # Email / SMTP (Gmail)
    # Maltix Auto-Fix: Detecta GMAIL_USER si SMTP_USER no está
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    
    # Hacemos que funcione con GMAIL_USER o SMTP_USER indistintamente
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER") or os.getenv("GMAIL_USER")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD") or os.getenv("GMAIL_PASSWORD")
    
    EMAILS_FROM_NAME: str = "NexoBot AI"

    # WhatsApp Evolution API (Gateway)
    WHATSAPP_EVOLUTION_URL: Optional[str] = os.getenv("WHATSAPP_EVOLUTION_URL")
    WHATSAPP_EVOLUTION_API_KEY: Optional[str] = os.getenv("WHATSAPP_EVOLUTION_API_KEY")
    WHATSAPP_MASTER_INSTANCE: str = os.getenv("WHATSAPP_MASTER_INSTANCE", "NexoBot_Main_v2")

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore" # Ignora variables extra para no dar error

settings = Settings()

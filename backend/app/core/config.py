from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "NexoBot AI Business Assistant"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "6f9d2a8b3c5e7f1a4d9b0c2e8f7a6b5d4c1e9f0a8b7d6c5e4a3b2f1e0d9c8b7a"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # Database
    DATABASE_URL: Optional[str] = "sqlite:///./database.db"
    
    @property
    def clean_database_url(self) -> str:
        return self.DATABASE_URL.strip().replace('"', '').replace("'", "")
    
    # AI
    GEMINI_API_KEY: Optional[str] = "TU_KEY_PERSONAL_AQUI"
    STRIPE_SECRET_KEY: Optional[str] = None
    VECTOR_DB_URL: Optional[str] = None
    BASE_URL: str = "https://nexobot-ai.onrender.com" # Cambiar por la URL real de Render
    FRONTEND_URL: str = "https://nexobot-ai.vercel.app" # Cambiar por la URL real de Vercel

    # Email / SMTP (Gmail)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_NAME: str = "NexoBot AI"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

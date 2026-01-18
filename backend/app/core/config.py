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
    DATABASE_URL: str = "sqlite:///./database.db"
    
    # AI
    GEMINI_API_KEY: Optional[str] = "TU_KEY_PERSONAL_AQUI"
    VECTOR_DB_URL: Optional[str] = None

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

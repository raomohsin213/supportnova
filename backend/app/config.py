import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "SupportNova AI Governance Engine"
    VERSION: str = "1.0.0"
    THEME: str = "Aptech TechWiz 7 - ResponseX Intelligence (Generative AI PowerPlay)"
    
    # API & Gemini Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    
    # Database
    DATABASE_PATH: Path = BASE_DIR / "support_nova.db"
    ASYNC_DATABASE_URL: str = f"sqlite+aiosqlite:///{DATABASE_PATH.as_posix()}"
    SYNC_DATABASE_URL: str = f"sqlite:///{DATABASE_PATH.as_posix()}"
    
    # Policy Uploads
    UPLOAD_DIR: Path = BASE_DIR / "uploads" / "policies"
    CHROMA_PERSIST_DIR: Path = BASE_DIR / "chroma_db"
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]
    
    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()

# Ensure directories exist
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.CHROMA_PERSIST_DIR.mkdir(parents=True, exist_ok=True)

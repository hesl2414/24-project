import os
from dataclasses import dataclass
from dotenv import load_dotenv
from pathlib import Path

# ✅ backend 기준 .env 로드
BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")


@dataclass
class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "Practice Agent API")
    APP_VERSION: str = os.getenv("APP_VERSION", "0.1.0")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    SQLITE_DB_PATH: str = os.getenv("SQLITE_DB_PATH", "./practice_agent.db")
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.getenv('SQLITE_DB_PATH', './practice_agent.db')}"
    )

    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-5.2")


settings = Settings()
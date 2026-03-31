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
    # 공통
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "openai").lower()
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0"))

    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    OPENAI_BASE_URL: str = os.getenv("OPENAI_BASE_URL", "")

    # Watsonx
    WATSONX_APIKEY: str = os.getenv("WATSONX_APIKEY", "")
    WATSONX_URL: str = os.getenv("WATSONX_URL", "")
    WATSONX_PROJECT_ID: str = os.getenv("WATSONX_PROJECT_ID", "")
    WATSONX_MODEL: str = os.getenv("WATSONX_MODEL", "ibm/granite-3-8b-instruct")

    # Ollama
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen3:8b")


settings = Settings()
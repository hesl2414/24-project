from openai import OpenAI

from app.core.settings import settings


class LLMFactory:
    _client = None

    @classmethod
    def get_client(cls) -> OpenAI:
        if cls._client is None:
            if not settings.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY가 설정되지 않았습니다.")
            cls._client = OpenAI(api_key=settings.OPENAI_API_KEY)
        return cls._client

    @classmethod
    def get_model_name(cls) -> str:
        return settings.OPENAI_MODEL
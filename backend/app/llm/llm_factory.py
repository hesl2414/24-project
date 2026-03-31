from app.core.settings import settings

from langchain_openai import ChatOpenAI
from langchain_ollama import ChatOllama

try:
    from langchain_ibm import ChatWatsonx
except ImportError:
    ChatWatsonx = None


class LLMFactory:
    _llm = None

    @classmethod
    def get_llm(cls):
        if cls._llm is not None:
            return cls._llm

        provider = settings.LLM_PROVIDER

        if provider == "openai":
            if not settings.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY가 설정되지 않았습니다.")

            kwargs = {
                "model": settings.OPENAI_MODEL,
                "temperature": settings.LLM_TEMPERATURE,
                "api_key": settings.OPENAI_API_KEY,
            }

            if settings.OPENAI_BASE_URL:
                kwargs["base_url"] = settings.OPENAI_BASE_URL

            cls._llm = ChatOpenAI(**kwargs)
            return cls._llm

        elif provider == "watsonx":
            if ChatWatsonx is None:
                raise ImportError(
                    "langchain_ibm 이 설치되지 않았습니다. pip install langchain-ibm"
                )

            if not settings.WATSONX_APIKEY:
                raise ValueError("WATSONX_APIKEY가 설정되지 않았습니다.")
            if not settings.WATSONX_URL:
                raise ValueError("WATSONX_URL이 설정되지 않았습니다.")
            if not settings.WATSONX_PROJECT_ID:
                raise ValueError("WATSONX_PROJECT_ID가 설정되지 않았습니다.")

            cls._llm = ChatWatsonx(
                model_id=settings.WATSONX_MODEL,
                url=settings.WATSONX_URL,
                apikey=settings.WATSONX_APIKEY,
                project_id=settings.WATSONX_PROJECT_ID,
                params={
                    "temperature": settings.LLM_TEMPERATURE,
                },
            )
            return cls._llm

        elif provider == "ollama":
            cls._llm = ChatOllama(
                model=settings.OLLAMA_MODEL,
                base_url=settings.OLLAMA_BASE_URL,
                temperature=settings.LLM_TEMPERATURE,
            )
            return cls._llm

        raise ValueError(f"지원하지 않는 LLM_PROVIDER 입니다: {provider}")

    @classmethod
    def get_model_name(cls) -> str:
        provider = settings.LLM_PROVIDER

        if provider == "openai":
            return settings.OPENAI_MODEL
        elif provider == "watsonx":
            return settings.WATSONX_MODEL
        elif provider == "ollama":
            return settings.OLLAMA_MODEL

        return "unknown"

    @classmethod
    def reset(cls):
        cls._llm = None
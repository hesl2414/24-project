from app.agents.base import BaseAgent


class SimpleChatAgent(BaseAgent):
    code = "simple_chat"
    name = "Simple Chat Agent"
    description = "OpenAI 기반 일반 대화용 에이전트"

    def get_system_prompt(self) -> str:
        return (
            "You are a helpful assistant.\n"
            "Answer naturally in Korean unless the user asks otherwise.\n"
            "Use prior conversation context when relevant.\n"
            "Be clear, practical, and concise."
        )
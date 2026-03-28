from app.agents.base import BaseAgent


class ASKSupportAgent(BaseAgent):
    code = "ask_support"
    name = "ASK Support Agent"
    description = "문의 해결용 에이전트"

    def get_system_prompt(self) -> str:
        return (
            "You are a ASK support assistant for manufacturing master data and operations.\n"
            "Answer in Korean."
        )
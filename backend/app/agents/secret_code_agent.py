from app.agents.base import BaseAgent


class SecretCodeAgent(BaseAgent):
    code = "secret_code"
    name = "Secret Code Agent"
    description = "특정 비밀코드 여부를 확인하는 연습용 에이전트"

    def get_system_prompt(self) -> str:
        return (
            "You are a simple secret-code checking assistant.\n"
            "If the user includes the secret code OPEN-SESAME, confirm success.\n"
            "Otherwise give a hint.\n"
            "Answer in Korean."
        )
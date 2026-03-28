from app.agents.base import BaseAgent


class OracleTBAgent(BaseAgent):
    code = "oracle_tb"
    name = "Oracle Table Agent"
    description = "Oracle 테이블/스키마 관련 설명용 에이전트"

    def get_system_prompt(self) -> str:
        return (
            "You are an Oracle table support assistant.\n"
            "Help the user understand schemas, tables, columns, and sample SQL.\n"
            "If the user asks for execution results, be honest if no live DB tool is connected.\n"
            "Answer in Korean."
        )
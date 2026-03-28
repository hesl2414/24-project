from typing import Dict, List

from app.agents.base import BaseAgent
from app.agents.simple_chat_agent import SimpleChatAgent
from app.agents.secret_code_agent import SecretCodeAgent
from app.agents.oracle_tb_agent import OracleTBAgent
from app.agents.ask_support_agent import ASKSupportAgent


class AgentRepository:
    def __init__(self):
        self._agents: Dict[str, BaseAgent] = {}
        self._register_default_agents()

    def _register_default_agents(self):
        self.register(SimpleChatAgent())
        self.register(SecretCodeAgent())
        self.register(OracleTBAgent())
        self.register(ASKSupportAgent())

    def register(self, agent: BaseAgent):
        self._agents[agent.code] = agent

    def get(self, code: str) -> BaseAgent | None:
        return self._agents.get(code)

    def list_agents(self) -> List[BaseAgent]:
        return list(self._agents.values())
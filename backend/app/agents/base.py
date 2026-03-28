from abc import ABC
from dataclasses import dataclass, field
from typing import List, Dict, Any


@dataclass
class AgentResult:
    content: str
    used_tools: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


class BaseAgent(ABC):
    code: str
    name: str
    description: str

    def get_system_prompt(self) -> str:
        return (
            f"You are {self.name}.\n"
            f"Description: {self.description}\n"
            "Use the provided conversation history when relevant.\n"
            "Answer in Korean unless the user requests otherwise.\n"
            "Be accurate and concise."
        )
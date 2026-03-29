from __future__ import annotations

from abc import ABC
from typing import Any


class BaseAgent(ABC):
    code: str = ""
    name: str = ""
    description: str = ""

    def get_system_prompt(self) -> str:
        return ""

    def supports_custom_invoke(self) -> bool:
        return False

    def invoke(self, **kwargs) -> dict[str, Any]:
        raise NotImplementedError(
            f"{self.__class__.__name__} does not implement custom invoke."
        )
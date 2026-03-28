from typing import Optional, List
from pydantic import BaseModel


class AgentInfo(BaseModel):
    code: str
    name: str
    description: str


class AgentInvokeRequest(BaseModel):
    user_id: str
    message: str
    chat_id: Optional[str] = None


class AgentInvokeResponse(BaseModel):
    chat_id: str
    agent_code: str
    user_message: str
    assistant_message: str
    used_tools: List[str] = []
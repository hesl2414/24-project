from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


class ChatSessionCreate(BaseModel):
    user_id: str = Field(..., description="사용자 ID")
    title: Optional[str] = "New Chat"
    agent_code: Optional[str] = None


class ChatSessionResponse(BaseModel):
    chat_id: str
    user_id: str
    title: str
    agent_code: Optional[str] = None
    summary_text: Optional[str] = None
    summary_updated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ChatMessageCreate(BaseModel):
    role: str
    content: str
    agent_code: Optional[str] = None
    tool_name: Optional[str] = None
    tool_args: Optional[str] = None
    tool_result: Optional[str] = None


class ChatMessageResponse(BaseModel):
    message_id: str
    chat_id: str
    seq_no: int
    role: str
    content: str
    agent_code: Optional[str] = None
    tool_name: Optional[str] = None
    tool_args: Optional[str] = None
    tool_result: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatRunLogResponse(BaseModel):
    run_id: str
    chat_id: str
    agent_code: str
    user_message: str
    assistant_message: Optional[str] = None
    status: str
    error_message: Optional[str] = None
    used_tools: Optional[str] = None
    model_name: Optional[str] = None
    started_at: datetime
    ended_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatDetailResponse(BaseModel):
    session: ChatSessionResponse
    messages: List[ChatMessageResponse]
    run_logs: List[ChatRunLogResponse]
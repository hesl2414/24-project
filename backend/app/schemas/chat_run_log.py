from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


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

    class Config:
        from_attributes = True


class ChatRunStepLogResponse(BaseModel):
    step_log_id: str
    run_id: str
    step_no: Optional[int] = None
    step_name: Optional[str] = None
    log_type: str
    tool_name: Optional[str] = None
    input_data: Optional[str] = None
    output_data: Optional[str] = None
    status: str
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
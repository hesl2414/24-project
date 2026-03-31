# ============================================
# app/schemas/admin.py
# ============================================
from __future__ import annotations

from datetime import datetime
from typing import Any, List, Optional, Literal

from pydantic import BaseModel, Field


RunStatus = Literal["RUNNING", "SUCCESS", "ERROR"]


class DashboardSummaryResponse(BaseModel):
    todayChats: int
    todayRuns: int
    todayErrors: int
    activeAgents: int


class ChatSessionItemResponse(BaseModel):
    chat_id: str
    user_id: str
    title: str
    agent_code: str
    last_message_at: Optional[datetime] = None
    last_run_status: Optional[RunStatus] = None
    created_at: datetime
    updated_at: datetime


class ChatSessionDetailResponse(BaseModel):
    chat_id: str
    user_id: str
    title: str
    agent_code: str
    summary_text: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ChatMessageItemResponse(BaseModel):
    message_id: str
    chat_id: str
    seq_no: int
    role: str
    content: str
    tool_name: Optional[str] = None
    tool_args: Optional[Any] = None
    tool_result: Optional[Any] = None
    created_at: datetime


class RunLogItemResponse(BaseModel):
    run_id: str
    chat_id: str
    user_id: Optional[str] = None
    agent_code: str
    status: RunStatus
    user_message: str
    assistant_message: Optional[str] = None
    used_tools: Optional[List[str]] = None
    error_message: Optional[str] = None
    model_name: Optional[str] = None
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_ms: Optional[int] = None


class RunLogDetailResponse(RunLogItemResponse):
    raw_input: Optional[Any] = None
    raw_output: Optional[Any] = None


class RunStepItemResponse(BaseModel):
    step_id: str
    run_id: str
    step_order: int
    node_name: str
    step_type: str
    status: RunStatus
    input_snapshot: Optional[Any] = None
    output_snapshot: Optional[Any] = None
    error_message: Optional[str] = None
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_ms: Optional[int] = None


class AgentStatItemResponse(BaseModel):
    agent_code: str
    agent_name: str
    description: Optional[str] = None
    is_active: bool = True
    run_count: int = 0
    error_count: int = 0
    success_count: int = 0
    last_called_at: Optional[datetime] = None


class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int = Field(..., ge=1)
    size: int = Field(..., ge=1)
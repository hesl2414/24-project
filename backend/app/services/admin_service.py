# ============================================
# app/services/admin_service.py
# ============================================
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.repositories.admin_repository import AdminRepository
from app.schemas.admin import (
    DashboardSummaryResponse,
    ChatSessionItemResponse,
    ChatSessionDetailResponse,
    ChatMessageItemResponse,
    RunLogItemResponse,
    RunLogDetailResponse,
    RunStepItemResponse,
    AgentStatItemResponse,
)
from app.utils.json_utils import parse_json_field, parse_used_tools


class AdminService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AdminRepository(db)

        # agent_registry 테이블 없을 때 임시
        self.agent_meta = {
            "simple_chat_agent": {
                "agent_name": "Simple Chat Agent",
                "description": "일반 대화 에이전트",
                "is_active": True,
            },
            "bom_agent": {
                "agent_name": "BOM Agent",
                "description": "BOM 생성/조회/진단 에이전트",
                "is_active": True,
            },
            "oracle_tb_agent": {
                "agent_name": "Oracle TB Agent",
                "description": "오라클 스키마/조회 에이전트",
                "is_active": True,
            },
            "secret_code_agent": {
                "agent_name": "Secret Code Agent",
                "description": "테스트/예제 에이전트",
                "is_active": True,
            },
        }

    @staticmethod
    def _duration_ms(started_at: datetime | None, ended_at: datetime | None) -> int | None:
        if not started_at or not ended_at:
            return None
        return int((ended_at - started_at).total_seconds() * 1000)

    def get_dashboard_summary(self) -> DashboardSummaryResponse:
        return DashboardSummaryResponse(
            todayChats=self.repo.count_today_chats(),
            todayRuns=self.repo.count_today_runs(),
            todayErrors=self.repo.count_today_errors(),
            activeAgents=self.repo.count_active_agents(),
        )

    def get_recent_runs(self, limit: int = 10) -> list[RunLogItemResponse]:
        rows = self.repo.get_recent_runs(limit=limit)
        result = []
        for run, user_id in rows:
            result.append(
                RunLogItemResponse(
                    run_id=run.run_id,
                    chat_id=run.chat_id,
                    user_id=user_id,
                    agent_code=run.agent_code,
                    status=run.status,
                    user_message=run.user_message,
                    assistant_message=run.assistant_message,
                    used_tools=parse_used_tools(run.used_tools),
                    error_message=run.error_message,
                    model_name=run.model_name,
                    started_at=run.started_at,
                    ended_at=run.ended_at,
                    duration_ms=self._duration_ms(run.started_at, run.ended_at),
                )
            )
        return result

    def get_recent_chats(self, limit: int = 10) -> list[ChatSessionItemResponse]:
        rows = self.repo.get_recent_chats(limit=limit)
        result = []
        for chat, last_message_at, last_run_status in rows:
            result.append(
                ChatSessionItemResponse(
                    chat_id=chat.chat_id,
                    user_id=chat.user_id,
                    title=chat.title,
                    agent_code=chat.agent_code,
                    last_message_at=last_message_at,
                    last_run_status=last_run_status,
                    created_at=chat.created_at,
                    updated_at=chat.updated_at,
                )
            )
        return result

    def search_chats(
        self,
        page: int,
        size: int,
        user_id: Optional[str] = None,
        agent_code: Optional[str] = None,
        status: Optional[str] = None,
        keyword: Optional[str] = None,
    ):
        total, rows = self.repo.search_chats(
            page=page,
            size=size,
            user_id=user_id,
            agent_code=agent_code,
            status=status,
            keyword=keyword,
        )

        items = []
        for chat, last_message_at, last_run_status in rows:
            items.append(
                ChatSessionItemResponse(
                    chat_id=chat.chat_id,
                    user_id=chat.user_id,
                    title=chat.title,
                    agent_code=chat.agent_code,
                    last_message_at=last_message_at,
                    last_run_status=last_run_status,
                    created_at=chat.created_at,
                    updated_at=chat.updated_at,
                )
            )
        return total, items

    def get_chat_detail(self, chat_id: str) -> ChatSessionDetailResponse | None:
        chat = self.repo.get_chat_detail(chat_id)
        if not chat:
            return None

        return ChatSessionDetailResponse(
            chat_id=chat.chat_id,
            user_id=chat.user_id,
            title=chat.title,
            agent_code=chat.agent_code,
            summary_text=chat.summary_text,
            created_at=chat.created_at,
            updated_at=chat.updated_at,
        )

    def get_chat_messages(self, chat_id: str) -> list[ChatMessageItemResponse]:
        messages = self.repo.get_chat_messages(chat_id)
        result = []

        for msg in messages:
            result.append(
                ChatMessageItemResponse(
                    message_id=msg.message_id,
                    chat_id=msg.chat_id,
                    seq_no=msg.seq_no,
                    role=msg.role,
                    content=msg.content,
                    tool_name=msg.tool_name,
                    tool_args=parse_json_field(msg.tool_args),
                    tool_result=parse_json_field(msg.tool_result),
                    created_at=msg.created_at,
                )
            )
        return result

    def search_runs(
        self,
        page: int,
        size: int,
        agent_code: Optional[str] = None,
        status: Optional[str] = None,
        user_id: Optional[str] = None,
        keyword: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
    ):
        total, rows = self.repo.search_runs(
            page=page,
            size=size,
            agent_code=agent_code,
            status=status,
            user_id=user_id,
            keyword=keyword,
            date_from=date_from,
            date_to=date_to,
        )

        items = []
        for run, user_id_value in rows:
            items.append(
                RunLogItemResponse(
                    run_id=run.run_id,
                    chat_id=run.chat_id,
                    user_id=user_id_value,
                    agent_code=run.agent_code,
                    status=run.status,
                    user_message=run.user_message,
                    assistant_message=run.assistant_message,
                    used_tools=parse_used_tools(run.used_tools),
                    error_message=run.error_message,
                    model_name=run.model_name,
                    started_at=run.started_at,
                    ended_at=run.ended_at,
                    duration_ms=self._duration_ms(run.started_at, run.ended_at),
                )
            )
        return total, items

    def get_run_detail(self, run_id: str) -> RunLogDetailResponse | None:
        row = self.repo.get_run_detail(run_id)
        if not row:
            return None

        run, user_id = row
        return RunLogDetailResponse(
            run_id=run.run_id,
            chat_id=run.chat_id,
            user_id=user_id,
            agent_code=run.agent_code,
            status=run.status,
            user_message=run.user_message,
            assistant_message=run.assistant_message,
            used_tools=parse_used_tools(run.used_tools),
            error_message=run.error_message,
            model_name=run.model_name,
            started_at=run.started_at,
            ended_at=run.ended_at,
            duration_ms=self._duration_ms(run.started_at, run.ended_at),
            raw_input=parse_json_field(run.raw_input),
            raw_output=parse_json_field(run.raw_output),
        )

    def get_run_steps(self, run_id: str) -> list[RunStepItemResponse]:
        steps = self.repo.get_run_steps(run_id)
        result = []

        for step in steps:
            result.append(
                RunStepItemResponse(
                    step_id=step.step_log_id,
                    run_id=step.run_id,
                    step_order=step.step_order or step.step_no,
                    node_name=step.step_name,
                    step_type=step.log_type,
                    status=step.status,
                    input_snapshot=parse_json_field(step.input_data),
                    output_snapshot=parse_json_field(step.output_data),
                    error_message=step.error_message,
                    started_at=step.created_at,
                    ended_at=step.created_at,
                    duration_ms=None,
                )
            )
        return result

    def get_agent_stats(self) -> list[AgentStatItemResponse]:
        rows = self.repo.get_agent_stats()
        result = []

        for row in rows:
            meta = self.agent_meta.get(
                row.agent_code,
                {
                    "agent_name": row.agent_code,
                    "description": None,
                    "is_active": True,
                },
            )

            result.append(
                AgentStatItemResponse(
                    agent_code=row.agent_code,
                    agent_name=meta["agent_name"],
                    description=meta["description"],
                    is_active=meta["is_active"],
                    run_count=int(row.run_count or 0),
                    success_count=int(row.success_count or 0),
                    error_count=int(row.error_count or 0),
                    last_called_at=row.last_called_at,
                )
            )

        return sorted(result, key=lambda x: x.run_count, reverse=True)
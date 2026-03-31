# ============================================
# app/repositories/admin_repository.py
# ============================================
from __future__ import annotations

from datetime import datetime, time
from typing import Optional

from sqlalchemy import and_, func, or_, desc, case
from sqlalchemy.orm import Session

from app.models.chat import (
    ChatSession,
    ChatMessage,
)
from app.models.chat_run_log import (
    ChatRunLog,
    ChatRunStepLog,
)



class AdminRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_today_range(self):
        today = datetime.now().date()
        start_dt = datetime.combine(today, time.min)
        end_dt = datetime.combine(today, time.max)
        return start_dt, end_dt

    def count_today_chats(self) -> int:
        start_dt, end_dt = self.get_today_range()
        return (
            self.db.query(func.count(ChatSession.chat_id))
            .filter(ChatSession.created_at.between(start_dt, end_dt))
            .scalar()
            or 0
        )

    def count_today_runs(self) -> int:
        start_dt, end_dt = self.get_today_range()
        return (
            self.db.query(func.count(ChatRunLog.run_id))
            .filter(ChatRunLog.started_at.between(start_dt, end_dt))
            .scalar()
            or 0
        )

    def count_today_errors(self) -> int:
        start_dt, end_dt = self.get_today_range()
        return (
            self.db.query(func.count(ChatRunLog.run_id))
            .filter(
                ChatRunLog.started_at.between(start_dt, end_dt),
                ChatRunLog.status == "ERROR",
            )
            .scalar()
            or 0
        )

    def count_active_agents(self) -> int:
        return (
            self.db.query(func.count(func.distinct(ChatRunLog.agent_code)))
            .scalar()
            or 0
        )

    def get_recent_runs(self, limit: int = 10):
        return (
            self.db.query(ChatRunLog, ChatSession.user_id)
            .join(ChatSession, ChatRunLog.chat_id == ChatSession.chat_id)
            .order_by(desc(ChatRunLog.started_at))
            .limit(limit)
            .all()
        )

    def get_recent_chats(self, limit: int = 10):
        last_message_subq = (
            self.db.query(
                ChatMessage.chat_id.label("chat_id"),
                func.max(ChatMessage.created_at).label("last_message_at"),
            )
            .group_by(ChatMessage.chat_id)
            .subquery()
        )

        last_run_subq = (
            self.db.query(
                ChatRunLog.chat_id.label("chat_id"),
                func.max(ChatRunLog.started_at).label("last_run_at"),
            )
            .group_by(ChatRunLog.chat_id)
            .subquery()
        )

        return (
            self.db.query(
                ChatSession,
                last_message_subq.c.last_message_at,
                ChatRunLog.status.label("last_run_status"),
            )
            .outerjoin(last_message_subq, ChatSession.chat_id == last_message_subq.c.chat_id)
            .outerjoin(last_run_subq, ChatSession.chat_id == last_run_subq.c.chat_id)
            .outerjoin(
                ChatRunLog,
                and_(
                    ChatRunLog.chat_id == last_run_subq.c.chat_id,
                    ChatRunLog.started_at == last_run_subq.c.last_run_at,
                ),
            )
            .order_by(desc(ChatSession.updated_at))
            .limit(limit)
            .all()
        )

    def search_chats(
        self,
        page: int,
        size: int,
        user_id: Optional[str] = None,
        agent_code: Optional[str] = None,
        status: Optional[str] = None,
        keyword: Optional[str] = None,
    ):
        last_message_subq = (
            self.db.query(
                ChatMessage.chat_id.label("chat_id"),
                func.max(ChatMessage.created_at).label("last_message_at"),
            )
            .group_by(ChatMessage.chat_id)
            .subquery()
        )

        last_run_subq = (
            self.db.query(
                ChatRunLog.chat_id.label("chat_id"),
                func.max(ChatRunLog.started_at).label("last_run_at"),
            )
            .group_by(ChatRunLog.chat_id)
            .subquery()
        )

        query = (
            self.db.query(
                ChatSession,
                last_message_subq.c.last_message_at,
                ChatRunLog.status.label("last_run_status"),
            )
            .outerjoin(last_message_subq, ChatSession.chat_id == last_message_subq.c.chat_id)
            .outerjoin(last_run_subq, ChatSession.chat_id == last_run_subq.c.chat_id)
            .outerjoin(
                ChatRunLog,
                and_(
                    ChatRunLog.chat_id == last_run_subq.c.chat_id,
                    ChatRunLog.started_at == last_run_subq.c.last_run_at,
                ),
            )
        )

        if user_id:
            query = query.filter(ChatSession.user_id == user_id)

        if agent_code:
            query = query.filter(ChatSession.agent_code == agent_code)

        if status:
            query = query.filter(ChatRunLog.status == status)

        if keyword:
            query = query.filter(
                or_(
                    ChatSession.title.ilike(f"%{keyword}%"),
                    ChatSession.chat_id.ilike(f"%{keyword}%"),
                    ChatSession.user_id.ilike(f"%{keyword}%"),
                )
            )

        total = query.count()

        rows = (
            query.order_by(desc(ChatSession.updated_at))
            .offset((page - 1) * size)
            .limit(size)
            .all()
        )

        return total, rows

    def get_chat_detail(self, chat_id: str):
        return (
            self.db.query(ChatSession)
            .filter(ChatSession.chat_id == chat_id)
            .first()
        )

    def get_chat_messages(self, chat_id: str):
        return (
            self.db.query(ChatMessage)
            .filter(ChatMessage.chat_id == chat_id)
            .order_by(ChatMessage.seq_no.asc())
            .all()
        )

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
        query = (
            self.db.query(ChatRunLog, ChatSession.user_id)
            .join(ChatSession, ChatRunLog.chat_id == ChatSession.chat_id)
        )

        if agent_code:
            query = query.filter(ChatRunLog.agent_code == agent_code)

        if status:
            query = query.filter(ChatRunLog.status == status)

        if user_id:
            query = query.filter(ChatSession.user_id == user_id)

        if keyword:
            query = query.filter(
                or_(
                    ChatRunLog.user_message.ilike(f"%{keyword}%"),
                    ChatRunLog.assistant_message.ilike(f"%{keyword}%"),
                    ChatRunLog.run_id.ilike(f"%{keyword}%"),
                    ChatRunLog.chat_id.ilike(f"%{keyword}%"),
                )
            )

        if date_from:
            query = query.filter(ChatRunLog.started_at >= date_from)

        if date_to:
            query = query.filter(ChatRunLog.started_at <= date_to)

        total = query.count()

        rows = (
            query.order_by(desc(ChatRunLog.started_at))
            .offset((page - 1) * size)
            .limit(size)
            .all()
        )

        return total, rows

    def get_run_detail(self, run_id: str):
        return (
            self.db.query(ChatRunLog, ChatSession.user_id)
            .join(ChatSession, ChatRunLog.chat_id == ChatSession.chat_id)
            .filter(ChatRunLog.run_id == run_id)
            .first()
        )

    def get_run_steps(self, run_id: str):
        return (
            self.db.query(ChatRunStepLog)
            .filter(ChatRunStepLog.run_id == run_id)
            .order_by(ChatRunStepLog.step_order.asc())
            .all()
        )

    def get_agent_stats(self):
        rows = (
            self.db.query(
                ChatRunLog.agent_code,
                func.count(ChatRunLog.run_id).label("run_count"),

                func.sum(
                    case((ChatRunLog.status == "SUCCESS", 1), else_=0)
                ).label("success_count"),

                func.sum(
                    case((ChatRunLog.status == "ERROR", 1), else_=0)
                ).label("error_count"),

                func.max(ChatRunLog.started_at).label("last_called_at"),
            )
            .group_by(ChatRunLog.agent_code)
            .all()
        )
        return rows
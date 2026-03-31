from datetime import datetime
from typing import Optional, List

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.chat import ChatSession, ChatMessage
from app.models.chat_run_log import ChatRunLog


class ChatRepository:
    def create_session(
        self,
        db: Session,
        user_id: str,
        title: str,
        agent_code: Optional[str] = None,
        site_code: str | None = None,
    ) -> ChatSession:
        session = ChatSession(
            user_id=user_id,
            title=title,
            agent_code=agent_code,
            site_code=site_code,
        )
        db.add(session)
        db.flush()
        db.refresh(session)
        return session

    def get_session(self, db: Session, chat_id: str) -> Optional[ChatSession]:
        stmt = select(ChatSession).where(ChatSession.chat_id == chat_id)
        return db.execute(stmt).scalar_one_or_none()

    def get_sessions_by_user(self, db: Session, user_id: str) -> List[ChatSession]:
        stmt = (
            select(ChatSession)
            .where(ChatSession.user_id == user_id)
            .order_by(ChatSession.updated_at.desc())
        )
        return list(db.execute(stmt).scalars().all())

    def delete_session(self, db: Session, chat_id: str) -> bool:
        session = self.get_session(db, chat_id)
        if not session:
            return False
        db.delete(session)
        return True

    def get_next_seq_no(self, db: Session, chat_id: str) -> int:
        stmt = select(func.max(ChatMessage.seq_no)).where(ChatMessage.chat_id == chat_id)
        current_max = db.execute(stmt).scalar_one_or_none()
        return 1 if current_max is None else current_max + 1

    def add_message(
        self,
        db: Session,
        chat_id: str,
        role: str,
        content: str,
        agent_code: Optional[str] = None,
        tool_name: Optional[str] = None,
        tool_args: Optional[str] = None,
        tool_result: Optional[str] = None,
    ) -> ChatMessage:
        seq_no = self.get_next_seq_no(db, chat_id)
        message = ChatMessage(
            chat_id=chat_id,
            seq_no=seq_no,
            role=role,
            content=content,
            agent_code=agent_code,
            tool_name=tool_name,
            tool_args=tool_args,
            tool_result=tool_result,
        )
        db.add(message)

        session = self.get_session(db, chat_id)
        if session:
            session.updated_at = datetime.utcnow()

        db.flush()
        db.refresh(message)
        return message

    def get_messages(self, db: Session, chat_id: str) -> List[ChatMessage]:
        stmt = (
            select(ChatMessage)
            .where(ChatMessage.chat_id == chat_id)
            .order_by(ChatMessage.seq_no.asc())
        )
        return list(db.execute(stmt).scalars().all())

    def update_session_summary(
        self,
        db: Session,
        chat_id: str,
        summary_text: str,
    ) -> Optional[ChatSession]:
        session = self.get_session(db, chat_id)
        if not session:
            return None

        session.summary_text = summary_text
        session.summary_updated_at = datetime.utcnow()
        session.updated_at = datetime.utcnow()
        db.flush()
        return session

    def create_run_log(
        self,
        db: Session,
        chat_id: str,
        agent_code: str,
        user_message: str,
        model_name: Optional[str] = None,
    ) -> ChatRunLog:
        log = ChatRunLog(
            chat_id=chat_id,
            agent_code=agent_code,
            user_message=user_message,
            model_name=model_name,
            status="RUNNING",
        )
        db.add(log)
        db.flush()
        db.refresh(log)
        return log

    def complete_run_log(
        self,
        db: Session,
        run_id: str,
        assistant_message: str,
        used_tools: Optional[str] = None,
    ) -> Optional[ChatRunLog]:
        stmt = select(ChatRunLog).where(ChatRunLog.run_id == run_id)
        log = db.execute(stmt).scalar_one_or_none()
        if not log:
            return None

        log.assistant_message = assistant_message
        log.used_tools = used_tools
        log.status = "SUCCESS"
        log.ended_at = datetime.utcnow()
        db.flush()
        return log

    def fail_run_log(
        self,
        db: Session,
        run_id: str,
        error_message: str,
    ) -> Optional[ChatRunLog]:
        stmt = select(ChatRunLog).where(ChatRunLog.run_id == run_id)
        log = db.execute(stmt).scalar_one_or_none()
        if not log:
            return None

        log.status = "ERROR"
        log.error_message = error_message
        log.ended_at = datetime.utcnow()
        db.flush()
        return log

    def get_run_logs(self, db: Session, chat_id: str) -> List[ChatRunLog]:
        stmt = (
            select(ChatRunLog)
            .where(ChatRunLog.chat_id == chat_id)
            .order_by(ChatRunLog.created_at.asc())
        )
        return list(db.execute(stmt).scalars().all())

    def get_run_logs_by_chat_id(self, db: Session, chat_id: str) -> list[ChatRunLog]:
        stmt = (
            select(ChatRunLog)
            .where(ChatRunLog.chat_id == chat_id)
            .order_by(ChatRunLog.started_at.desc(), ChatRunLog.created_at.desc())
        )
        return list(db.execute(stmt).scalars().all())
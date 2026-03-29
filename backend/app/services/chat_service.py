from typing import List, Optional
from sqlalchemy.orm import Session

from app.repositories.chat_repository import ChatRepository
from app.models.chat import ChatSession, ChatMessage
from app.models.chat_run_log import ChatRunLog


class ChatService:
    def __init__(self, chat_repository: ChatRepository):
        self.chat_repository = chat_repository

    def create_chat(
        self,
        db: Session,
        user_id: str,
        title: str = "New Chat",
        agent_code: Optional[str] = None,
    ) -> ChatSession:
        return self.chat_repository.create_session(
            db=db,
            user_id=user_id,
            title=title,
            agent_code=agent_code,
        )

    def get_chat(self, db: Session, chat_id: str) -> Optional[ChatSession]:
        return self.chat_repository.get_session(db, chat_id)

    def get_user_chats(self, db: Session, user_id: str) -> List[ChatSession]:
        return self.chat_repository.get_sessions_by_user(db, user_id)

    def delete_chat(self, db: Session, chat_id: str) -> bool:
        return self.chat_repository.delete_session(db, chat_id)

    def add_message(
        self,
        db: Session,
        chat_id: str,
        role: str,
        content: str,
        agent_code: str | None = None,
        tool_name: str | None = None,
        tool_args: str | None = None,
        tool_result: str | None = None,
    ) -> ChatMessage:
        return self.chat_repository.add_message(
            db=db,
            chat_id=chat_id,
            role=role,
            content=content,
            agent_code=agent_code,
            tool_name=tool_name,
            tool_args=tool_args,
            tool_result=tool_result,
        )

    def get_messages(self, db: Session, chat_id: str) -> List[ChatMessage]:
        return self.chat_repository.get_messages(db, chat_id)

    def update_session_summary(
        self,
        db: Session,
        chat_id: str,
        summary_text: str,
    ) -> ChatSession | None:
        return self.chat_repository.update_session_summary(
            db=db,
            chat_id=chat_id,
            summary_text=summary_text,
        )

    def create_run_log(
        self,
        db: Session,
        chat_id: str,
        agent_code: str,
        user_message: str,
        model_name: str | None = None,
    ) -> ChatRunLog:
        return self.chat_repository.create_run_log(
            db=db,
            chat_id=chat_id,
            agent_code=agent_code,
            user_message=user_message,
            model_name=model_name,
        )

    def complete_run_log(
        self,
        db: Session,
        run_id: str,
        assistant_message: str,
        used_tools: str | None = None,
    ) -> ChatRunLog | None:
        return self.chat_repository.complete_run_log(
            db=db,
            run_id=run_id,
            assistant_message=assistant_message,
            used_tools=used_tools,
        )

    def fail_run_log(
        self,
        db: Session,
        run_id: str,
        error_message: str,
    ) -> ChatRunLog | None:
        return self.chat_repository.fail_run_log(
            db=db,
            run_id=run_id,
            error_message=error_message,
        )

    def get_run_logs(self, db: Session, chat_id: str) -> List[ChatRunLog]:
        return self.chat_repository.get_run_logs(db, chat_id)
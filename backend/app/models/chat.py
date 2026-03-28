import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class ChatSession(Base):
    __tablename__ = "chat_session"

    chat_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(100), nullable=False, index=True)
    title = Column(String(200), nullable=False, default="New Chat")
    agent_code = Column(String(100), nullable=True)

    summary_text = Column(Text, nullable=True)  # 추가
    summary_updated_at = Column(DateTime, nullable=True)  # 추가

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    messages = relationship(
        "ChatMessage",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="ChatMessage.seq_no",
    )
    run_logs = relationship(
        "ChatRunLog",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="ChatRunLog.created_at",
    )


class ChatMessage(Base):
    __tablename__ = "chat_message"

    message_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chat_id = Column(String(36), ForeignKey("chat_session.chat_id"), nullable=False, index=True)
    seq_no = Column(Integer, nullable=False)
    role = Column(String(20), nullable=False)  # user / assistant / system / tool
    content = Column(Text, nullable=False)

    agent_code = Column(String(100), nullable=True)  # 추가
    tool_name = Column(String(200), nullable=True)
    tool_args = Column(Text, nullable=True)
    tool_result = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    session = relationship("ChatSession", back_populates="messages")


class ChatRunLog(Base):
    __tablename__ = "chat_run_log"

    run_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chat_id = Column(String(36), ForeignKey("chat_session.chat_id"), nullable=False, index=True)

    agent_code = Column(String(100), nullable=False)
    user_message = Column(Text, nullable=False)
    assistant_message = Column(Text, nullable=True)

    status = Column(String(20), nullable=False, default="SUCCESS")  # RUNNING / SUCCESS / ERROR
    error_message = Column(Text, nullable=True)

    used_tools = Column(Text, nullable=True)
    model_name = Column(String(100), nullable=True)

    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ended_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    session = relationship("ChatSession", back_populates="run_logs")
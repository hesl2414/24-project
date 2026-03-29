import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


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
    step_logs = relationship(
        "ChatRunStepLog",
        back_populates="run",
        cascade="all, delete-orphan",
        order_by="ChatRunStepLog.created_at",
    )


class ChatRunStepLog(Base):
    __tablename__ = "chat_run_step_log"

    step_log_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String(36), ForeignKey("chat_run_log.run_id"), nullable=False, index=True)

    step_no = Column(Integer, nullable=True)
    step_name = Column(String(200), nullable=True)

    log_type = Column(String(50), nullable=False)   # ROUTE / RULEBOOK / STEP / SKIP / ANSWER / ERROR / END
    tool_name = Column(String(200), nullable=True)

    input_data = Column(Text, nullable=True)
    output_data = Column(Text, nullable=True)

    status = Column(String(20), nullable=False, default="SUCCESS")  # SUCCESS / FAILED / SKIPPED
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    run = relationship("ChatRunLog", back_populates="step_logs")
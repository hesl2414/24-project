import json
from datetime import datetime
from typing import Any, List, Optional

from sqlalchemy.orm import Session

from app.models.chat_run_log import ChatRunLog, ChatRunStepLog


def _safe_json(data: Any) -> Optional[str]:
    if data is None:
        return None
    try:
        return json.dumps(data, ensure_ascii=False, default=str)
    except Exception:
        return json.dumps({"raw": str(data)}, ensure_ascii=False)

class ChatRunLogRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_run_log(
        self,
        chat_id: str,
        agent_code: str,
        user_message: str,
        model_name: Optional[str] = None,
        status: str = "RUNNING",
    ) -> ChatRunLog:
        run_log = ChatRunLog(
            chat_id=chat_id,
            agent_code=agent_code,
            user_message=user_message,
            model_name=model_name,
            status=status,
            started_at=datetime.utcnow(),
        )
        self.db.add(run_log)
        self.db.flush()
        return run_log

    def update_run_log_result(
        self,
        run_id: str,
        assistant_message: Optional[str] = None,
        status: str = "SUCCESS",
        error_message: Optional[str] = None,
        used_tools: Optional[List[str]] = None,
    ) -> ChatRunLog:
        run_log = self.db.query(ChatRunLog).filter(ChatRunLog.run_id == run_id).one()

        run_log.assistant_message = assistant_message
        run_log.status = status
        run_log.error_message = error_message
        run_log.used_tools = _safe_json(used_tools) if used_tools else None
        run_log.ended_at = datetime.utcnow()

        self.db.flush()
        return run_log

    def add_step_log(
        self,
        run_id: str,
        log_type: str,
        status: str = "SUCCESS",
        step_no: Optional[int] = None,
        step_name: Optional[str] = None,
        tool_name: Optional[str] = None,
        input_data: Any = None,
        output_data: Any = None,
        error_message: Optional[str] = None,
    ) -> ChatRunStepLog:
        step_log = ChatRunStepLog(
            run_id=run_id,
            step_no=step_no,
            step_name=step_name,
            log_type=log_type,
            tool_name=tool_name,
            input_data=_safe_json(input_data),
            output_data=_safe_json(output_data),
            status=status,
            error_message=error_message,
            created_at=datetime.utcnow(),
        )
        self.db.add(step_log)
        self.db.flush()
        return step_log

    def get_run_log(self, run_id: str) -> Optional[ChatRunLog]:
        return self.db.query(ChatRunLog).filter(ChatRunLog.run_id == run_id).one_or_none()

    def get_step_logs(self, run_id: str) -> List[ChatRunStepLog]:
        return (
            self.db.query(ChatRunStepLog)
            .filter(ChatRunStepLog.run_id == run_id)
            .order_by(ChatRunStepLog.created_at.asc())
            .all()
        )

    def commit(self) -> None:
        self.db.commit()

    def rollback(self) -> None:
        self.db.rollback()

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.chat_run_log import (
    ChatRunLogResponse,
    ChatRunStepLogResponse,
)
from app.services.chat_service import ChatService
from app.repositories.chat_repository import ChatRepository


router = APIRouter(prefix="/api", tags=["chat-run-logs"])


def get_chat_service() -> ChatService:
    return ChatService(chat_repository=ChatRepository())


@router.get(
    "/chat-runs/{run_id}",
    response_model=ChatRunLogResponse,
)
def get_chat_run_log(
    run_id: str,
    db: Session = Depends(get_db),
    chat_service: ChatService = Depends(get_chat_service),
):
    run_log = chat_service.get_run_log(db=db, run_id=run_id)
    if not run_log:
        raise HTTPException(status_code=404, detail="run_log not found")
    return run_log


@router.get(
    "/chat-runs/{run_id}/steps",
    response_model=List[ChatRunStepLogResponse],
)
def get_chat_run_step_logs(
    run_id: str,
    db: Session = Depends(get_db),
    chat_service: ChatService = Depends(get_chat_service),
):
    run_log = chat_service.get_run_log(db=db, run_id=run_id)
    if not run_log:
        raise HTTPException(status_code=404, detail="run_log not found")

    return chat_service.get_step_logs_by_run_id(db=db, run_id=run_id)


@router.get(
    "/chats/{chat_id}/runs",
    response_model=List[ChatRunLogResponse],
)
def get_chat_runs(
    chat_id: str,
    db: Session = Depends(get_db),
    chat_service: ChatService = Depends(get_chat_service),
):
    chat = chat_service.get_chat(db=db, chat_id=chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="chat not found")

    return chat_service.get_run_logs_by_chat_id(db=db, chat_id=chat_id)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_chat_service
from app.schemas.chat import (
    ChatSessionCreate,
    ChatSessionResponse,
    ChatMessageCreate,
    ChatMessageResponse,
    ChatDetailResponse,
)
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chats", tags=["Chats"])


@router.post("", response_model=ChatSessionResponse)
def create_chat(
    request: ChatSessionCreate,
    db: Session = Depends(get_db),
    chat_service: ChatService = Depends(get_chat_service),
):
    session = chat_service.create_chat(
        db=db,
        user_id=request.user_id,
        title=request.title or "New Chat",
        agent_code=request.agent_code,
        site_code=request.site_code,
    )
    db.commit()
    db.refresh(session)
    return session


@router.get("/{chat_id}", response_model=ChatDetailResponse)
def get_chat_detail(
    chat_id: str,
    db: Session = Depends(get_db),
    chat_service: ChatService = Depends(get_chat_service),
):
    session = chat_service.get_chat(db, chat_id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    messages = chat_service.get_messages(db, chat_id)
    run_logs = chat_service.get_step_logs_by_run_id(db, chat_id)

    return {
        "session": session,
        "messages": messages,
        "run_logs": run_logs,
    }


@router.get("/user/{user_id}", response_model=list[ChatSessionResponse])
def get_user_chats(
    user_id: str,
    db: Session = Depends(get_db),
    chat_service: ChatService = Depends(get_chat_service),
):
    return chat_service.get_user_chats(db, user_id)


@router.post("/{chat_id}/messages", response_model=ChatMessageResponse)
def add_message(
    chat_id: str,
    request: ChatMessageCreate,
    db: Session = Depends(get_db),
    chat_service: ChatService = Depends(get_chat_service),
):
    session = chat_service.get_chat(db, chat_id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    message = chat_service.add_message(
        db=db,
        chat_id=chat_id,
        role=request.role,
        content=request.content,
        agent_code=request.agent_code,
        tool_name=request.tool_name,
        tool_args=request.tool_args,
        tool_result=request.tool_result,
    )
    db.commit()
    db.refresh(message)
    return message


@router.delete("/{chat_id}")
def delete_chat(
    chat_id: str,
    db: Session = Depends(get_db),
    chat_service: ChatService = Depends(get_chat_service),
):
    deleted = chat_service.delete_chat(db, chat_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Chat session not found")

    db.commit()
    return {"message": "deleted"}
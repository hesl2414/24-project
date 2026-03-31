# ============================================
# app/api/routers/admin_router.py
# ============================================
from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_app_db
from app.schemas.admin import PaginatedResponse
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["admin"])


def get_admin_service(db: Session = Depends(get_app_db)) -> AdminService:
    return AdminService(db)


@router.get("/dashboard/summary")
def get_dashboard_summary(
    service: AdminService = Depends(get_admin_service),
):
    return service.get_dashboard_summary()


@router.get("/dashboard/recent-runs")
def get_recent_runs(
    limit: int = Query(10, ge=1, le=100),
    service: AdminService = Depends(get_admin_service),
):
    return service.get_recent_runs(limit=limit)


@router.get("/dashboard/recent-chats")
def get_recent_chats(
    limit: int = Query(10, ge=1, le=100),
    service: AdminService = Depends(get_admin_service),
):
    return service.get_recent_chats(limit=limit)


@router.get("/chats")
def get_chats(
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=200),
    user_id: Optional[str] = None,
    agent_code: Optional[str] = None,
    status: Optional[str] = None,
    keyword: Optional[str] = None,
    service: AdminService = Depends(get_admin_service),
):
    total, items = service.search_chats(
        page=page,
        size=size,
        user_id=user_id,
        agent_code=agent_code,
        status=status,
        keyword=keyword,
    )
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        size=size,
    )


@router.get("/chats/{chat_id}")
def get_chat_detail(
    chat_id: str,
    service: AdminService = Depends(get_admin_service),
):
    result = service.get_chat_detail(chat_id)
    if not result:
        raise HTTPException(status_code=404, detail="Chat not found")
    return result


@router.get("/chats/{chat_id}/messages")
def get_chat_messages(
    chat_id: str,
    service: AdminService = Depends(get_admin_service),
):
    return service.get_chat_messages(chat_id)


@router.get("/runs")
def get_runs(
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=200),
    agent_code: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[str] = None,
    keyword: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    service: AdminService = Depends(get_admin_service),
):
    total, items = service.search_runs(
        page=page,
        size=size,
        agent_code=agent_code,
        status=status,
        user_id=user_id,
        keyword=keyword,
        date_from=date_from,
        date_to=date_to,
    )
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        size=size,
    )


@router.get("/runs/{run_id}")
def get_run_detail(
    run_id: str,
    service: AdminService = Depends(get_admin_service),
):
    result = service.get_run_detail(run_id)
    if not result:
        raise HTTPException(status_code=404, detail="Run not found")
    return result


@router.get("/runs/{run_id}/steps")
def get_run_steps(
    run_id: str,
    service: AdminService = Depends(get_admin_service),
):
    return service.get_run_steps(run_id)


@router.get("/agents")
def get_agents(
    service: AdminService = Depends(get_admin_service),
):
    return service.get_agent_stats()
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_agent_service
from app.schemas.agent import AgentInfo, AgentInvokeRequest, AgentInvokeResponse
from app.services.agent_service import AgentService

router = APIRouter(prefix="/agents", tags=["Agents"])


@router.get("", response_model=list[AgentInfo])
def list_agents(
    agent_service: AgentService = Depends(get_agent_service),
):
    agents = agent_service.list_agents()
    return [
        AgentInfo(
            code=agent.code,
            name=agent.name,
            description=agent.description,
        )
        for agent in agents
    ]


@router.post("/{agent_code}/invoke", response_model=AgentInvokeResponse)
def invoke_agent(
    agent_code: str,
    request: AgentInvokeRequest,
    db: Session = Depends(get_db),
    agent_service: AgentService = Depends(get_agent_service),
):
    try:
        result = agent_service.invoke_agent(
            db=db,
            agent_code=agent_code,
            user_id=request.user_id,
            message=request.message,
            chat_id=request.chat_id,
        )
        db.commit()
        return result
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
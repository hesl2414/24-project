from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.db_manager import db_manager
from app.repositories.chat_repository import ChatRepository
from app.repositories.agent_repository import AgentRepository
from app.services.chat_service import ChatService
from app.services.agent_service import AgentService
from app.services.site_context_service import SiteContextService


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()


chat_repository = ChatRepository()
agent_repository = AgentRepository()
site_context_service = SiteContextService()

chat_service = ChatService(chat_repository=chat_repository)
agent_service = AgentService(
    agent_repository=agent_repository,
    chat_service=chat_service,
    db_manager=db_manager,
    site_context_service=site_context_service,
)


def get_chat_service() -> ChatService:
    return chat_service


def get_agent_service() -> AgentService:
    return agent_service
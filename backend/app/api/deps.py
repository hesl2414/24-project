from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.repositories.chat_repository import ChatRepository
from app.repositories.agent_repository import AgentRepository
from app.services.chat_service import ChatService
from app.services.agent_service import AgentService


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()


chat_repository = ChatRepository()
agent_repository = AgentRepository()

chat_service = ChatService(chat_repository=chat_repository)
agent_service = AgentService(
    agent_repository=agent_repository,
    chat_service=chat_service,
)


def get_chat_service() -> ChatService:
    return chat_service


def get_agent_service() -> AgentService:
    return agent_service
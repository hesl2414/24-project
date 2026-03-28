from app.core.database import Base, engine
from app.models.chat import ChatSession, ChatMessage, ChatRunLog  # noqa: F401


def init():
    Base.metadata.create_all(bind=engine)
    print("SQLite DB 초기화 완료")


if __name__ == "__main__":
    init()
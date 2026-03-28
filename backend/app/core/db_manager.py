from contextlib import contextmanager
from sqlalchemy.orm import Session

from app.core.database import SessionLocal


class DBManager:
    def __init__(self):
        self._session_local = SessionLocal

    @contextmanager
    def session_scope(self):
        db: Session = self._session_local()
        try:
            yield db
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    def get_session(self) -> Session:
        return self._session_local()


db_manager = DBManager()
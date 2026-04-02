from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.settings import settings


class DBManager:
    def __init__(self):
        self._sessionmakers = {}

        db_url_map = {
            "app": settings.DATABASE_URL,
            "sihif": settings.SIHIF_DB_URL,
            "system": settings.SYSTEM_DB_URL,
            "sysdat": settings.SYSDAT_DB_URL,
            "mos": settings.MOS_DB_URL,
        }

        for db_name, db_url in db_url_map.items():
            if not db_url:
                continue

            connect_args = {}
            if db_url.startswith("sqlite"):
                connect_args = {"check_same_thread": False}

            engine = create_engine(
                db_url,
                echo=False,
                future=True,
                connect_args=connect_args,
            )
            self._sessionmakers[db_name] = sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=engine,
                future=True,
            )

    def get_session(self, db_name: str = "app") -> Session:
        if db_name not in self._sessionmakers:
            raise ValueError(f"등록되지 않은 db_name: {db_name}")
        return self._sessionmakers[db_name]()

    @contextmanager
    def session_scope(self, db_name: str = "app"):
        db = self.get_session(db_name)
        try:
            yield db
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()


db_manager = DBManager()
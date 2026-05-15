from collections.abc import Generator
from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.db.base import Base

__all__ = ["Base", "get_engine", "SessionLocal", "get_session"]


class EngineHolder:
    _engine_override: object | None = None


def get_engine(url: str | None = None):
    """Create (or reuse) synchronous engine."""
    if EngineHolder._engine_override is not None:
        return EngineHolder._engine_override
    from app.core.config import get_settings

    settings = get_settings()
    database_url = url or settings.database_url
    echo = settings.env == "development" and database_url.startswith("postgresql")
    return create_engine(
        database_url,
        pool_pre_ping=True,
        echo=echo,
    )


@lru_cache
def _session_factory_for_url(url: str) -> sessionmaker[Session]:
    eng = create_engine(url, pool_pre_ping=True)
    return sessionmaker(autocommit=False, autoflush=False, bind=eng)


def SessionLocal(url: str | None = None) -> sessionmaker[Session]:
    from app.core.config import get_settings

    if url is None:
        return sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
    return _session_factory_for_url(url)


def get_session() -> Generator[Session, None, None]:
    """FastAPI dependency: one request, one transaction (commit after success)."""
    factory = SessionLocal()
    db = factory()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

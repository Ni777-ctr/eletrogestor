"""Configuracao do SQLAlchemy: engine, sessao e dependency get_db."""
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import get_settings

settings = get_settings()

# SQLite e usado apenas como alternativa local de desenvolvimento, quando o
# PostgreSQL/Docker ainda nao esta disponivel. Em producao, DATABASE_URL deve
# apontar para PostgreSQL. O check_same_thread permite que as rotas sincronas
# do FastAPI compartilhem a conexao local com seguranca no ambiente de testes.
engine_options = {"pool_pre_ping": True, "future": True}
if settings.DATABASE_URL.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, **engine_options)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

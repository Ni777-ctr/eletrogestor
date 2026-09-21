from datetime import datetime

from app.schemas.base import OrmModel


class AuditLogCreate(OrmModel):
    acao: str
    entidade: str
    entidade_id: str | None = None
    bot: str | None = None
    antes: dict | None = None
    depois: dict | None = None


class AuditLogOut(OrmModel):
    id: int
    usuario_id: int | None = None
    bot: str | None = None
    acao: str
    entidade: str
    entidade_id: str | None = None
    antes: dict | None = None
    depois: dict | None = None
    criado_em: datetime

"""Helper simples para gravar entradas de auditoria a partir dos routers."""
from sqlalchemy.orm import Session

from app.models.auditoria import AuditLog


def registrar(
    db: Session,
    *,
    usuario_id: int | None,
    acao: str,
    entidade: str,
    entidade_id: str | None = None,
    antes: dict | None = None,
    depois: dict | None = None,
) -> None:
    db.add(
        AuditLog(
            usuario_id=usuario_id,
            acao=acao,
            entidade=entidade,
            entidade_id=entidade_id,
            antes=antes,
            depois=depois,
        )
    )

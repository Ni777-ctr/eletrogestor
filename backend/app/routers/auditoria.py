from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, requer_permissao
from app.models.auditoria import AuditLog
from app.models.usuario import Usuario
from app.schemas.auditoria import AuditLogCreate, AuditLogOut

router = APIRouter(prefix="/auditoria", tags=["Auditoria"])


@router.get("", response_model=list[AuditLogOut])
def listar_logs(
    entidade: str | None = None,
    limite: int = 200,
    db: Session = Depends(get_db),
    _=Depends(requer_permissao("auditoria:read")),
):
    query = db.query(AuditLog)
    if entidade:
        query = query.filter(AuditLog.entidade == entidade)
    return query.order_by(AuditLog.criado_em.desc()).limit(min(limite, 500)).all()


@router.post("", response_model=AuditLogOut, status_code=status.HTTP_201_CREATED)
def registrar_log(
    dados: AuditLogCreate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)
):
    """Qualquer usuario autenticado pode registrar um log da propria acao."""
    log = AuditLog(usuario_id=usuario.id, **dados.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

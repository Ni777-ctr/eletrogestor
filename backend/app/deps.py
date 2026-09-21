"""Dependencies de autenticacao (usuario logado) e autorizacao (RBAC por permissao)."""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.security import decodificar_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    credenciais_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais invalidas ou expiradas.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credenciais_invalidas

    payload = decodificar_token(token)
    if not payload or "sub" not in payload:
        raise credenciais_invalidas
    if payload.get("tipo") == "mfa_pendente":
        # Token temporario emitido antes da 2a etapa do login (POST
        # /auth/mfa/validar) -- nao concede acesso a rotas protegidas.
        raise credenciais_invalidas

    usuario = db.query(Usuario).filter(Usuario.usuario == payload["sub"]).first()
    if not usuario or not usuario.ativo:
        raise credenciais_invalidas
    return usuario


def tem_permissao(usuario: Usuario, chave: str) -> bool:
    """Checagem pontual de permissao (fora do padrao Depends), usada quando a
    permissao necessaria so e conhecida em tempo de execucao -- ex.: qual
    transicao de status especifica esta sendo tentada."""
    permissoes = set(usuario.perfil.permissoes or [])
    return "*" in permissoes or chave in permissoes


def requer_permissao(*permissoes_necessarias: str):
    """Dependency factory: bloqueia o endpoint se o perfil do usuario nao tiver
    nenhuma das permissoes informadas (nem o coringa "*")."""

    def checador(usuario: Usuario = Depends(get_current_user)) -> Usuario:
        permissoes_usuario = set(usuario.perfil.permissoes or [])
        if "*" in permissoes_usuario:
            return usuario
        if not permissoes_usuario.intersection(permissoes_necessarias):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seu perfil nao tem permissao para esta acao.",
            )
        return usuario

    return checador

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auditoria_utils import registrar
from app.config import get_settings
from app.database import get_db
from app.deps import get_current_user, requer_permissao
from app.models.usuario import RefreshToken, Usuario
from app.schemas.auth import (
    ConviteCreate,
    ConviteResponse,
    DefinirSenhaConvite,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    MfaConfirmarRequest,
    MfaDesabilitarRequest,
    MfaIniciarResponse,
    MfaValidarRequest,
    RefreshRequest,
    TokenResponse,
    UsuarioPublico,
)
from app.schemas.usuario import UsuarioOut
from app.security import (
    PERFIS_COM_2FA_OBRIGATORIO,
    criar_access_token,
    criar_token_temporario,
    decodificar_token,
    gerar_mfa_secret,
    gerar_provisioning_uri,
    gerar_token_opaco,
    hash_senha,
    hash_token_opaco,
    verificar_codigo_totp,
    verificar_senha,
)

router = APIRouter(prefix="/auth", tags=["Autenticacao"])
settings = get_settings()


def _agora() -> datetime:
    return datetime.now(timezone.utc)


def _aware(dt: datetime | None) -> datetime | None:
    """Normaliza datetimes vindos do banco para timezone-aware (UTC).
    Necessario porque alguns backends (ex.: SQLite, usado em testes) nao
    preservam o tzinfo mesmo em colunas DateTime(timezone=True)."""
    if dt is None:
        return None
    return dt if dt.tzinfo is not None else dt.replace(tzinfo=timezone.utc)


def _serializar_usuario_publico(usuario: Usuario) -> UsuarioPublico:
    return UsuarioPublico(
        id=usuario.id,
        nome=usuario.nome,
        usuario=usuario.usuario,
        email=usuario.email,
        ativo=usuario.ativo,
        perfil_id=usuario.perfil_id,
        mfa_habilitado=usuario.mfa_habilitado,
        mfa_obrigatorio=(usuario.perfil_id in PERFIS_COM_2FA_OBRIGATORIO) and not usuario.mfa_habilitado,
    )


def _gerar_par_tokens(db: Session, usuario: Usuario) -> dict:
    access_token = criar_access_token(subject=usuario.usuario, extra_claims={"perfil_id": usuario.perfil_id})

    refresh_bruto = gerar_token_opaco()
    db.add(
        RefreshToken(
            usuario_id=usuario.id,
            token_hash=hash_token_opaco(refresh_bruto),
            expira_em=_agora() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DIAS),
        )
    )
    return {"access_token": access_token, "refresh_token": refresh_bruto}


@router.post("/login", response_model=LoginResponse)
def login(dados: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.usuario == dados.usuario).first()

    if not usuario:
        # Nao revela se o usuario existe ou nao.
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario ou senha invalidos.")

    agora = _agora()

    # Desbloqueio automatico apos o tempo configurado.
    if _aware(usuario.bloqueado_ate) and _aware(usuario.bloqueado_ate) <= agora:
        usuario.bloqueado_ate = None
        usuario.tentativas_login_falhas = 0
        registrar(db, usuario_id=usuario.id, acao="usuario_desbloqueado_automatico", entidade="usuarios", entidade_id=str(usuario.id))

    if _aware(usuario.bloqueado_ate) and _aware(usuario.bloqueado_ate) > agora:
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=f"Usuario bloqueado ate {usuario.bloqueado_ate.isoformat()} por excesso de tentativas invalidas.",
        )

    if not usuario.senha_definida:
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Este usuario ainda nao definiu a senha (convite pendente).",
        )

    if not usuario.ativo:
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario inativo.")

    if not verificar_senha(dados.senha, usuario.senha_hash):
        usuario.tentativas_login_falhas += 1
        registrar(
            db,
            usuario_id=usuario.id,
            acao="login_falhou",
            entidade="usuarios",
            entidade_id=str(usuario.id),
            depois={"tentativas_login_falhas": usuario.tentativas_login_falhas},
        )
        acabou_de_bloquear = False
        if usuario.tentativas_login_falhas >= settings.MAX_TENTATIVAS_LOGIN:
            usuario.bloqueado_ate = agora + timedelta(minutes=settings.BLOQUEIO_MINUTOS)
            acabou_de_bloquear = True
            registrar(
                db,
                usuario_id=usuario.id,
                acao="usuario_bloqueado",
                entidade="usuarios",
                entidade_id=str(usuario.id),
                depois={"bloqueado_ate": usuario.bloqueado_ate.isoformat()},
            )
        db.commit()
        if acabou_de_bloquear:
            # A propria tentativa que cruzou o limite ja informa o bloqueio,
            # em vez de deixar o usuario descobrir isso so na proxima tentativa.
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=f"Usuario bloqueado ate {usuario.bloqueado_ate.isoformat()} por excesso de tentativas invalidas.",
            )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario ou senha invalidos.")

    # Senha correta.
    usuario.tentativas_login_falhas = 0

    if usuario.mfa_habilitado:
        mfa_token = criar_token_temporario(
            usuario.usuario, settings.MFA_TOKEN_EXPIRE_MINUTOS, {"tipo": "mfa_pendente"}
        )
        registrar(db, usuario_id=usuario.id, acao="login_senha_ok_aguardando_mfa", entidade="usuarios", entidade_id=str(usuario.id))
        db.commit()
        return LoginResponse(mfa_pendente=True, mfa_token=mfa_token)

    usuario.ultimo_login_em = agora
    registrar(db, usuario_id=usuario.id, acao="login_sucesso", entidade="usuarios", entidade_id=str(usuario.id))
    tokens = _gerar_par_tokens(db, usuario)
    db.commit()
    db.refresh(usuario)
    return LoginResponse(mfa_pendente=False, usuario=_serializar_usuario_publico(usuario), **tokens)


@router.post("/mfa/validar", response_model=TokenResponse)
def validar_mfa(dados: MfaValidarRequest, db: Session = Depends(get_db)):
    payload = decodificar_token(dados.mfa_token)
    invalido = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="mfa_token invalido ou expirado.")
    if not payload or payload.get("tipo") != "mfa_pendente" or "sub" not in payload:
        raise invalido

    usuario = db.query(Usuario).filter(Usuario.usuario == payload["sub"]).first()
    if not usuario or not usuario.ativo or not usuario.mfa_habilitado:
        raise invalido

    if not verificar_codigo_totp(usuario.mfa_secret, dados.codigo):
        registrar(db, usuario_id=usuario.id, acao="mfa_codigo_invalido", entidade="usuarios", entidade_id=str(usuario.id))
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Codigo de verificacao invalido.")

    usuario.ultimo_login_em = _agora()
    registrar(db, usuario_id=usuario.id, acao="login_sucesso_mfa", entidade="usuarios", entidade_id=str(usuario.id))
    tokens = _gerar_par_tokens(db, usuario)
    db.commit()
    db.refresh(usuario)
    return TokenResponse(usuario=_serializar_usuario_publico(usuario), **tokens)


@router.post("/refresh", response_model=TokenResponse)
def refresh(dados: RefreshRequest, db: Session = Depends(get_db)):
    token_hash = hash_token_opaco(dados.refresh_token)
    registro = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()

    invalido = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token invalido ou expirado.")
    if not registro or registro.revogado or _aware(registro.expira_em) <= _agora():
        raise invalido

    usuario = db.get(Usuario, registro.usuario_id)
    if not usuario or not usuario.ativo:
        raise invalido

    # Rotaciona: revoga o token usado e emite um par novo.
    registro.revogado = True
    tokens = _gerar_par_tokens(db, usuario)
    db.commit()
    return TokenResponse(usuario=_serializar_usuario_publico(usuario), **tokens)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(dados: LogoutRequest, db: Session = Depends(get_db)):
    token_hash = hash_token_opaco(dados.refresh_token)
    registro = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if registro:
        registro.revogado = True
        db.commit()


@router.get("/me", response_model=UsuarioOut)
def me(usuario: Usuario = Depends(get_current_user)):
    return usuario


# ---------- Convite de senha (Administrador convida, usuario define a propria senha) ----------
@router.post("/convite", response_model=ConviteResponse, status_code=status.HTTP_201_CREATED)
def convidar_usuario(
    dados: ConviteCreate,
    db: Session = Depends(get_db),
    ator: Usuario = Depends(requer_permissao("usuarios:write")),
):
    if db.query(Usuario).filter(Usuario.usuario == dados.usuario).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Nome de usuario ja existe.")

    convite_bruto = gerar_token_opaco()
    expira_em = _agora() + timedelta(hours=settings.CONVITE_EXPIRA_HORAS)

    novo = Usuario(
        nome=dados.nome,
        usuario=dados.usuario,
        email=dados.email,
        # Hash de um valor aleatorio e inutilizavel ate o convite ser aceito.
        senha_hash=hash_senha(gerar_token_opaco()),
        perfil_id=dados.perfil_id,
        ativo=True,
        senha_definida=False,
        convite_token_hash=hash_token_opaco(convite_bruto),
        convite_expira_em=expira_em,
    )
    db.add(novo)
    db.flush()  # obtem novo.id
    registrar(db, usuario_id=ator.id, acao="usuario_convidado", entidade="usuarios", entidade_id=str(novo.id))
    db.commit()
    db.refresh(novo)

    return ConviteResponse(usuario_id=novo.id, convite_token=convite_bruto, expira_em=expira_em)


@router.post("/definir-senha", response_model=UsuarioOut)
def definir_senha_por_convite(dados: DefinirSenhaConvite, db: Session = Depends(get_db)):
    token_hash = hash_token_opaco(dados.convite_token)
    usuario = db.query(Usuario).filter(Usuario.convite_token_hash == token_hash).first()

    invalido = HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Convite invalido ou expirado.")
    if not usuario or usuario.senha_definida:
        raise invalido
    if not usuario.convite_expira_em or _aware(usuario.convite_expira_em) <= _agora():
        raise invalido

    usuario.senha_hash = hash_senha(dados.senha)
    usuario.senha_definida = True
    usuario.convite_token_hash = None
    usuario.convite_expira_em = None
    registrar(db, usuario_id=usuario.id, acao="senha_definida_por_convite", entidade="usuarios", entidade_id=str(usuario.id))
    db.commit()
    db.refresh(usuario)
    return usuario


# ---------- Desbloqueio manual (Administrador) ----------
@router.post("/usuarios/{usuario_id}/desbloquear", response_model=UsuarioOut)
def desbloquear_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    ator: Usuario = Depends(requer_permissao("usuarios:write")),
):
    usuario = db.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario nao encontrado.")

    usuario.bloqueado_ate = None
    usuario.tentativas_login_falhas = 0
    registrar(db, usuario_id=ator.id, acao="usuario_desbloqueado_manual", entidade="usuarios", entidade_id=str(usuario.id))
    db.commit()
    db.refresh(usuario)
    return usuario


# ---------- 2FA (TOTP) ----------
@router.post("/mfa/iniciar", response_model=MfaIniciarResponse)
def iniciar_mfa(db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    """Gera um novo segredo TOTP (ainda nao habilitado -- so apos /mfa/confirmar)."""
    secret = gerar_mfa_secret()
    usuario.mfa_secret = secret
    usuario.mfa_habilitado = False
    registrar(db, usuario_id=usuario.id, acao="mfa_setup_iniciado", entidade="usuarios", entidade_id=str(usuario.id))
    db.commit()
    return MfaIniciarResponse(secret=secret, otpauth_uri=gerar_provisioning_uri(secret, usuario.usuario))


@router.post("/mfa/confirmar", response_model=UsuarioOut)
def confirmar_mfa(
    dados: MfaConfirmarRequest, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)
):
    if not usuario.mfa_secret:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nenhum setup de 2FA em andamento. Chame /auth/mfa/iniciar primeiro.")
    if not verificar_codigo_totp(usuario.mfa_secret, dados.codigo):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Codigo de verificacao invalido.")

    usuario.mfa_habilitado = True
    registrar(db, usuario_id=usuario.id, acao="mfa_habilitado", entidade="usuarios", entidade_id=str(usuario.id))
    db.commit()
    db.refresh(usuario)
    return usuario


@router.post("/mfa/desabilitar", response_model=UsuarioOut)
def desabilitar_mfa(
    dados: MfaDesabilitarRequest, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)
):
    """O proprio usuario desabilita o 2FA, confirmando a senha."""
    if not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Senha incorreta.")

    usuario.mfa_habilitado = False
    usuario.mfa_secret = None
    registrar(db, usuario_id=usuario.id, acao="mfa_desabilitado", entidade="usuarios", entidade_id=str(usuario.id))
    db.commit()
    db.refresh(usuario)
    return usuario


@router.post("/usuarios/{usuario_id}/mfa/desabilitar", response_model=UsuarioOut)
def desabilitar_mfa_admin(
    usuario_id: int,
    db: Session = Depends(get_db),
    ator: Usuario = Depends(requer_permissao("usuarios:write")),
):
    """Recuperacao de acesso: Administrador desabilita o 2FA de outro usuario
    (ex.: perdeu o celular com o app autenticador)."""
    usuario = db.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario nao encontrado.")

    usuario.mfa_habilitado = False
    usuario.mfa_secret = None
    registrar(db, usuario_id=ator.id, acao="mfa_desabilitado_por_admin", entidade="usuarios", entidade_id=str(usuario.id))
    db.commit()
    db.refresh(usuario)
    return usuario

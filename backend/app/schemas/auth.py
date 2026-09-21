from datetime import datetime

from app.schemas.base import OrmModel


class LoginRequest(OrmModel):
    usuario: str
    senha: str


class RefreshRequest(OrmModel):
    refresh_token: str


class LogoutRequest(OrmModel):
    refresh_token: str


class UsuarioPublico(OrmModel):
    id: int
    nome: str
    usuario: str
    email: str | None = None
    ativo: bool
    perfil_id: str
    mfa_habilitado: bool = False
    mfa_obrigatorio: bool = False  # perfil exige 2FA mas ainda nao foi configurado/habilitado


class TokenResponse(OrmModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    usuario: UsuarioPublico


class LoginResponse(OrmModel):
    """Resposta de POST /auth/login: ou os tokens finais (mfa_pendente=False),
    ou um mfa_token temporario que deve ser trocado em POST /auth/mfa/validar
    (mfa_pendente=True) quando o usuario tem 2FA habilitado."""

    mfa_pendente: bool = False
    mfa_token: str | None = None
    access_token: str | None = None
    refresh_token: str | None = None
    token_type: str = "bearer"
    usuario: UsuarioPublico | None = None


class ConviteCreate(OrmModel):
    nome: str
    usuario: str
    email: str | None = None
    perfil_id: str


class ConviteResponse(OrmModel):
    usuario_id: int
    convite_token: str
    expira_em: datetime


class DefinirSenhaConvite(OrmModel):
    convite_token: str
    senha: str


# ---------- 2FA ----------
class MfaIniciarResponse(OrmModel):
    secret: str
    otpauth_uri: str


class MfaConfirmarRequest(OrmModel):
    codigo: str


class MfaDesabilitarRequest(OrmModel):
    senha: str


class MfaValidarRequest(OrmModel):
    mfa_token: str
    codigo: str

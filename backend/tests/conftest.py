"""Fixtures compartilhadas: banco SQLite em memoria isolado por teste (via
StaticPool, mesma conexao para toda a vida do teste), TestClient com o
get_db sobrescrito, e um perfil "administrador" (permissoes=["*"]) + usuario
'admin' ja logado prontos para uso."""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
import app.models  # noqa: F401 -- registra todos os modelos em Base.metadata
from app.main import app
from app.models.usuario import Perfil, Usuario
from app.security import hash_senha


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool, future=True
    )
    TestSessionLocal = sessionmaker(bind=engine, future=True)
    Base.metadata.create_all(engine)

    def override_get_db():
        db = TestSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestSessionLocal
    app.dependency_overrides.clear()


@pytest.fixture()
def client(db_session):
    from fastapi.testclient import TestClient

    return TestClient(app)


@pytest.fixture()
def perfil_admin(db_session):
    db = db_session()
    perfil = Perfil(id="administrador", nome="Administrador", descricao="x", categoria="GESTAO", permissoes=["*"])
    db.add(perfil)
    db.commit()
    db.close()
    return "administrador"


@pytest.fixture()
def usuario_admin(db_session, perfil_admin):
    db = db_session()
    usuario = Usuario(nome="Admin", usuario="admin", senha_hash=hash_senha("123456"), perfil_id=perfil_admin)
    db.add(usuario)
    db.commit()
    db.close()
    return {"usuario": "admin", "senha": "123456"}


@pytest.fixture()
def admin_headers(client, usuario_admin):
    r = client.post("/auth/login", json=usuario_admin)
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def criar_perfil(db_session, *, perfil_id: str, permissoes: list[str], categoria: str = "OPERACAO") -> str:
    """Helper para os testes criarem perfis com permissoes especificas."""
    db = db_session()
    db.add(Perfil(id=perfil_id, nome=perfil_id, descricao="teste", categoria=categoria, permissoes=permissoes))
    db.commit()
    db.close()
    return perfil_id


def criar_usuario(db_session, *, usuario: str, perfil_id: str, senha: str = "123456") -> dict:
    db = db_session()
    db.add(Usuario(nome=usuario, usuario=usuario, senha_hash=hash_senha(senha), perfil_id=perfil_id))
    db.commit()
    db.close()
    return {"usuario": usuario, "senha": senha}

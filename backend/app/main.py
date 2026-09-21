"""Ponto de entrada da API EletroGestor (FastAPI)."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import (
    auditoria,
    auth,
    automacao,
    clientes,
    compras,
    dashboard,
    equipes,
    estoque,
    financeiro,
    obras,
    parametros,
    perfis,
    programacao,
    usuarios,
)

settings = get_settings()
settings.validar_seguranca_producao()

app = FastAPI(
    title="EletroGestor API",
    description="Backend REST do EletroGestor: usuarios/perfis, clientes, obras, programacao, "
    "estoque/compras, faturamento/cobranca, auditoria, automacoes e parametros globais.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(perfis.router)
app.include_router(usuarios.router)
app.include_router(clientes.router)
app.include_router(equipes.router)
app.include_router(obras.router)
app.include_router(programacao.router)
app.include_router(estoque.router)
app.include_router(compras.router)
app.include_router(financeiro.router)
app.include_router(auditoria.router)
app.include_router(parametros.router)
app.include_router(automacao.router)
app.include_router(dashboard.router)


@app.get("/", tags=["Saude"])
def raiz():
    return {"status": "ok", "servico": "EletroGestor API"}


@app.get("/saude", tags=["Saude"])
def saude():
    return {"status": "ok"}

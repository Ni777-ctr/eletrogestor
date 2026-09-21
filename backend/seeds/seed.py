"""Seed inicial do banco: popula perfis (RBAC), um usuario admin por perfil-
chave, clientes/equipes/obras/medicoes/faturas compativeis com os dados
ficticios usados no frontend (src/data/*.ts), alem de parametros globais e
alguns registros de automacao/rede eletrica para o painel funcionar.

Uso:
    PYTHONPATH=. python seeds/seed.py
"""
from datetime import date, timedelta

from app.database import Base, SessionLocal, engine
import app.models  # noqa: F401 -- registra os modelos em Base.metadata
from app.models.automacao import EventoSelfHealing, LeituraSubestacao, PontoVegetacao, Subestacao
from app.models.cliente import Cliente
from app.models.equipe import Equipe
from app.models.estoque import Almoxarifado, EstoqueItem, Material
from app.models.compras import Fornecedor
from app.models.financeiro import Fatura, Medicao
from app.models.obra import Obra
from app.models.parametro import ParametroGlobal
from app.models.usuario import Perfil, Usuario
from app.security import hash_senha

# ---------------------------------------------------------------------------
# Perfis: os 21 perfis reais definidos em src/data/perfis.ts, com um mapa
# minimo de permissoes por categoria (ajuste conforme a regra de negocio
# evoluir). "administrador" recebe acesso total ("*").
# ---------------------------------------------------------------------------
PERMISSOES_PADRAO = [
    "usuarios:read", "usuarios:write",
    "clientes:read", "clientes:write",
    "equipes:read", "equipes:write",
    "obras:read", "obras:write",
    "programacao:read", "programacao:write",
    "estoque:read", "estoque:write",
    "compras:read", "compras:write",
    "financeiro:read", "financeiro:write",
    "auditoria:read",
    "parametros:read", "parametros:write",
    "automacoes:read", "automacoes:write",
    "dashboard:read",
]

# ---------------------------------------------------------------------------
# Transicoes de status de Obra/Pedido de compra sao permissoes proprias, no
# formato "obras:transicao:<de>:<para>" / "compras:transicao:<de>:<para>"
# (ver app/routers/obras.py e app/routers/compras.py). As atribuicoes abaixo
# sao um PONTO DE PARTIDA razoavel para uma construtora tipica -- ainda nao
# validado com o cliente -- e devem ser revisados/ajustados conforme a regra
# de negocio real for definida. Administrador/Desenvolvedor/Tester tem "*"
# e portanto ja cobrem todas as transicoes.
# ---------------------------------------------------------------------------
TRANSICOES_OBRA_GERENCIA = [
    "obras:transicao:proposta:contratada",
    "obras:transicao:contratada:em_execucao",
    "obras:transicao:em_execucao:concluida",
    "obras:transicao:proposta:cancelada",
    "obras:transicao:contratada:cancelada",
    "obras:transicao:em_execucao:cancelada",
]
TRANSICOES_PEDIDO_GERENCIA = [
    "compras:transicao:Aberto:Enviado",
    "compras:transicao:Enviado:Recebido",
    "compras:transicao:Aberto:Cancelado",
    "compras:transicao:Enviado:Cancelado",
]

PERFIS_SEED = [
    # (id, nome, descricao, categoria, permissoes)
    ("administrador", "Administrador", "Acesso total ao sistema, usuarios e parametros.", "GESTAO", ["*"]),
    ("gerencia-geral", "Gerencia Geral", "Visao consolidada de obras, produtividade e indicadores.", "GESTAO",
     ["obras:read", "equipes:read", "financeiro:read", "dashboard:read", "auditoria:read"]
     + TRANSICOES_OBRA_GERENCIA + TRANSICOES_PEDIDO_GERENCIA),
    ("administrativo", "Administrativo", "Rotinas administrativas, cadastros e documentos.", "GESTAO",
     ["clientes:read", "clientes:write", "usuarios:read", "dashboard:read"]),
    ("faturamento-medicao", "Faturamento / Medicao", "Medicao de obras concluidas e pendencias de faturamento.", "GESTAO",
     ["financeiro:read", "financeiro:write", "obras:read", "dashboard:read"]),
    ("programacao", "Programacao", "Programacao diaria de obras, equipes e veiculos.", "OPERACAO",
     ["programacao:read", "programacao:write", "obras:read", "equipes:read",
      "obras:transicao:contratada:em_execucao"]),
    ("supervisor", "Supervisor", "Acompanhamento da execucao e liberacao de servicos.", "OPERACAO",
     ["obras:read", "programacao:read", "equipes:read", "obras:transicao:em_execucao:concluida"]),
    ("encarregado", "Encarregado", "Conducao da equipe em campo e registro de execucao.", "OPERACAO",
     ["programacao:read", "obras:read"]),
    ("equipe-campo", "Equipe de Campo", "Checklists, evidencias fotograficas e apontamentos.", "OPERACAO",
     ["programacao:read"]),
    ("viabilizacao", "Viabilizacao", "Analise de viabilidade tecnica antes da execucao.", "OPERACAO",
     ["obras:read", "obras:write", "clientes:read", "obras:transicao:proposta:contratada"]),
    ("planejamento", "Planejamento", "Roteirizacao, clusterizacao e previsao de demanda.", "OPERACAO",
     ["obras:read", "programacao:read", "dashboard:read"]),
    ("almoxarifado", "Almoxarifado", "Retirada, instalacao e devolucao de materiais.", "SUPORTE",
     ["estoque:read", "estoque:write", "compras:read", "compras:transicao:Enviado:Recebido"]),
    ("suprimentos-compras", "Suprimentos / Compras", "Reposicao de estoque minimo e aquisicao de itens.", "SUPORTE",
     ["compras:read", "compras:write", "estoque:read",
      "compras:transicao:Aberto:Enviado", "compras:transicao:Aberto:Cancelado", "compras:transicao:Enviado:Cancelado"]),
    ("logistica-frota", "Logistica / Frota", "Gestao de veiculos, deslocamentos e disponibilidade.", "SUPORTE",
     ["equipes:read", "programacao:read"]),
    ("inventario", "Inventario", "Conferencia de inventario e reconciliacao de saldos.", "SUPORTE",
     ["estoque:read", "estoque:write"]),
    ("documentacao-pre-obra", "Documentacao Pre-Obra", "Pre-APR, projetos e liberacoes antes do inicio.", "SUPORTE",
     ["obras:read"]),
    ("documentacao-pos-obra", "Documentacao Pos-Obra", "As-built, evidencias e encerramento documental.", "SUPORTE",
     ["obras:read"]),
    ("seguranca-trabalho", "Seguranca do Trabalho", "Habilitacoes, zonas de seguranca e bloqueios de Pre-APR.", "SUPORTE",
     ["equipes:read", "obras:read"]),
    ("qualidade", "Qualidade", "Auditoria de execucao, divergencias e conformidade.", "SUPORTE",
     ["auditoria:read", "obras:read"]),
    ("visualizador", "Visualizador", "Acesso somente leitura aos paineis e relatorios.", "TECNICO",
     ["obras:read", "dashboard:read", "financeiro:read", "estoque:read"]),
    ("desenvolvedor", "Desenvolvedor", "Integracoes, endpoints e manutencao do sistema.", "TECNICO", ["*"]),
    ("tester", "Tester", "Validacao de fluxos, homologacao e testes de regressao.", "TECNICO", ["*"]),
]

# ---------------------------------------------------------------------------
# Obras ficticias (espelham src/data/mockGerencia.ts -> mockObras)
# ---------------------------------------------------------------------------
OBRAS_SEED = [
    dict(wl="DMP/A.SUL.25.00419", descricao="Rede MT - Trecho A", regional="A.SUL", status="em_execucao",
         valor_contrato=500000, custo_previsto=350000, custo_realizado=420000,
         avanco_previsto=70, avanco_realizado=60, necs_planejados=7000, necs_executados=4200, equipe_nome="Equipe Alfa"),
    dict(wl="DMP/A.SUL.25.00420", descricao="Poste e Transformador - Zona Sul", regional="A.SUL", status="em_execucao",
         valor_contrato=120000, custo_previsto=90000, custo_realizado=98000,
         avanco_previsto=50, avanco_realizado=55, necs_planejados=4500, necs_executados=2500, equipe_nome="Equipe Beta"),
    dict(wl="CTM/A.NORTE.25.00118", descricao="Extensao de Rede Rural", regional="A.NORTE", status="contratada",
         valor_contrato=200000, custo_previsto=150000, custo_realizado=0,
         avanco_previsto=0, avanco_realizado=0, necs_planejados=3800, necs_executados=0,
         dias_contratada=25, equipe_nome="Equipe Gama"),
    dict(wl="MNT/A.SUL.24.00087", descricao="Manutencao Preventiva - BT", regional="A.SUL", status="concluida",
         valor_contrato=80000, custo_previsto=60000, custo_realizado=58000,
         avanco_previsto=100, avanco_realizado=100, necs_planejados=2600, necs_executados=2600, equipe_nome="Equipe Alfa"),
    dict(wl="RDU/A.LESTE.25.00061", descricao="Rede Subterranea - Centro", regional="A.LESTE", status="proposta",
         valor_contrato=340000, custo_previsto=245000, custo_realizado=0,
         avanco_previsto=0, avanco_realizado=0, necs_planejados=2100, necs_executados=0, equipe_nome="Equipe Beta"),
]

# Medicoes/faturas ficticias (espelham src/data/faturamentoService.ts)
MEDICOES_SEED = [
    dict(wl="DMP/A.SUL.25.00419", contrato=500000, percentual=18, status="Rascunho", dias_parada=18),
    dict(wl="DMP/A.SUL.25.00420", contrato=120000, percentual=25, status="Aprovada", dias_parada=2),
    dict(wl="MNT/A.SUL.24.00087", contrato=80000, percentual=100, status="Aprovada", dias_parada=0),
]

FATURAS_SEED = [
    dict(wl="DMP/A.SUL.25.00420", valor=30000, vencimento=date(2026, 9, 25), status="Emitida",
         percentual_faturado=25, percentual_pago=0),
    dict(wl="MNT/A.SUL.24.00087", valor=80000, vencimento=date(2026, 9, 5), status="Atrasada",
         percentual_faturado=100, percentual_pago=0),
]


def seed() -> None:
    Base.metadata.create_all(bind=engine)  # garante as tabelas caso alembic ainda nao tenha rodado
    db = SessionLocal()
    try:
        # ---- Perfis ----
        for perfil_id, nome, descricao, categoria, permissoes in PERFIS_SEED:
            if not db.get(Perfil, perfil_id):
                db.add(Perfil(id=perfil_id, nome=nome, descricao=descricao, categoria=categoria, permissoes=permissoes))
        db.commit()

        # ---- Usuario administrador padrao ----
        if not db.query(Usuario).filter(Usuario.usuario == "admin").first():
            db.add(Usuario(
                nome="Administrador do Sistema",
                usuario="admin",
                email="admin@eletrogestor.local",
                senha_hash=hash_senha("admin123"),
                perfil_id="administrador",
                ativo=True,
            ))
            db.commit()

        # ---- Um usuario de teste por perfil (login = perfil_id, senha = <perfil_id>@teste) ----
        # Uso apenas para ambiente de desenvolvimento/homologacao.
        for perfil_id, nome, _descricao, _categoria, _permissoes in PERFIS_SEED:
            login = f"teste.{perfil_id}"
            if not db.query(Usuario).filter(Usuario.usuario == login).first():
                db.add(Usuario(
                    nome=f"Teste {nome}",
                    usuario=login,
                    email=f"{login}@eletrogestor.local",
                    senha_hash=hash_senha(f"{perfil_id}@teste"),
                    perfil_id=perfil_id,
                    ativo=True,
                ))
        db.commit()

        # ---- Cliente ficticio ----
        cliente = db.query(Cliente).filter(Cliente.nome == "TEES Engenharia").first()
        if not cliente:
            cliente = Cliente(nome="TEES Engenharia", documento="00.000.000/0001-00", contato="Contratos")
            db.add(cliente)
            db.commit()
            db.refresh(cliente)

        # ---- Equipes ----
        equipes_por_nome: dict[str, Equipe] = {}
        for nome in ("Equipe Alfa", "Equipe Beta", "Equipe Gama"):
            equipe = db.query(Equipe).filter(Equipe.nome == nome).first()
            if not equipe:
                equipe = Equipe(nome=nome, ativa=True)
                db.add(equipe)
                db.commit()
                db.refresh(equipe)
            equipes_por_nome[nome] = equipe

        # ---- Obras ----
        obras_por_wl: dict[str, Obra] = {}
        for dados in OBRAS_SEED:
            wl = dados["wl"]
            obra = db.query(Obra).filter(Obra.wl == wl).first()
            if not obra:
                equipe_nome = dados.pop("equipe_nome")
                obra = Obra(cliente_id=cliente.id, equipe_id=equipes_por_nome[equipe_nome].id, **dados)
                db.add(obra)
                db.commit()
                db.refresh(obra)
            obras_por_wl[wl] = obra

        # ---- Medicoes ----
        for dados in MEDICOES_SEED:
            wl = dados.pop("wl")
            obra = obras_por_wl[wl]
            existente = db.query(Medicao).filter(Medicao.obra_id == obra.id, Medicao.contrato == dados["contrato"]).first()
            if not existente:
                db.add(Medicao(obra_id=obra.id, **dados))
        db.commit()

        # ---- Faturas ----
        for dados in FATURAS_SEED:
            wl = dados.pop("wl")
            obra = obras_por_wl[wl]
            existente = db.query(Fatura).filter(Fatura.obra_id == obra.id, Fatura.valor == dados["valor"]).first()
            if not existente:
                db.add(Fatura(obra_id=obra.id, **dados))
        db.commit()

        # ---- Materiais / Almoxarifado / Estoque ----
        almox = db.query(Almoxarifado).filter(Almoxarifado.nome == "Almoxarifado Central").first()
        if not almox:
            almox = Almoxarifado(nome="Almoxarifado Central", regional="A.SUL")
            db.add(almox)
            db.commit()
            db.refresh(almox)

        materiais_seed = [
            ("POST-9M", "Poste de concreto 9m", "UN", 5),
            ("CAB-MT-35", "Cabo MT 35mm", "M", 200),
            ("TRAFO-75KVA", "Transformador 75kVA", "UN", 2),
        ]
        for codigo, nome, unidade, minimo in materiais_seed:
            material = db.query(Material).filter(Material.codigo == codigo).first()
            if not material:
                material = Material(codigo=codigo, nome=nome, unidade=unidade, estoque_minimo=minimo)
                db.add(material)
                db.commit()
                db.refresh(material)
            if not db.query(EstoqueItem).filter(
                EstoqueItem.almoxarifado_id == almox.id, EstoqueItem.material_id == material.id
            ).first():
                db.add(EstoqueItem(almoxarifado_id=almox.id, material_id=material.id, quantidade=minimo * 3))
        db.commit()

        # ---- Fornecedor ficticio ----
        if not db.query(Fornecedor).filter(Fornecedor.nome == "EPI Protege Ltda.").first():
            db.add(Fornecedor(nome="EPI Protege Ltda.", contato="Comercial", email="vendas@epiprotege.example"))
            db.commit()

        # ---- Parametros globais (espelham src/data/mockGerencia.ts) ----
        parametros_seed = [
            ("meta_mensal_necs", 20000, "Meta mensal de NECs executados."),
            ("valor_referencia_nec", 202, "Valor de referencia (R$) por NEC."),
            ("teto_maximo_desconto_antecipacao", 5, "Teto maximo (%) de desconto por antecipacao de pagamento."),
        ]
        for chave, valor, descricao in parametros_seed:
            if not db.get(ParametroGlobal, chave):
                db.add(ParametroGlobal(chave=chave, valor=valor, descricao=descricao))
        db.commit()

        # ---- Automacao / rede eletrica (para o painel nao ficar zerado) ----
        subestacao = db.query(Subestacao).filter(Subestacao.nome == "Subestacao A.SUL-01").first()
        if not subestacao:
            subestacao = Subestacao(nome="Subestacao A.SUL-01", operacao_remota_ativa=True)
            db.add(subestacao)
            db.commit()
            db.refresh(subestacao)
            db.add(LeituraSubestacao(
                subestacao_id=subestacao.id, temperatura_c=42.5, carga_percentual=68.0,
                vibracao_mm_s=1.2, alerta_gerado=False,
            ))
            db.add(EventoSelfHealing(
                subestacao_id=subestacao.id, resolvido_automaticamente=True, tempo_restauracao_segundos=45,
            ))
            db.add(PontoVegetacao(descricao="Proximo ao ramal A.SUL-01", risco="medio", resolvido=False))
            db.commit()

        print("Seed concluido com sucesso.")
        print("Usuario padrao: admin / admin123 (perfil: administrador) -- troque a senha em producao.")
        print("Usuarios de teste (1 por perfil): login 'teste.<perfil_id>' / senha '<perfil_id>@teste'")
    finally:
        db.close()


if __name__ == "__main__":
    seed()

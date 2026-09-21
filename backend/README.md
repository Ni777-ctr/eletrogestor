# EletroGestor — Backend

API REST em **FastAPI + SQLAlchemy + PostgreSQL** para o EletroGestor. O
frontend (`../src`, TanStack Start) já é construído esperando estes
endpoints — veja `../src/lib/api.ts`.

## Stack

- **FastAPI** (rotas, validação via Pydantic v2)
- **SQLAlchemy 2.0** (modelos/ORM)
- **Alembic** (migrations)
- **PostgreSQL** (banco de dados)
- **JWT** (`python-jose`) + **bcrypt** (`passlib`) para autenticação
- RBAC simples por perfil (tabela `perfis`, campo `permissoes`)

## Estrutura

```
backend/
├── app/
│   ├── main.py          # cria o FastAPI app e inclui os routers
│   ├── config.py         # variáveis de ambiente (.env)
│   ├── database.py       # engine/sessão SQLAlchemy
│   ├── security.py       # hash de senha + JWT
│   ├── deps.py            # get_current_user, requer_permissao (RBAC)
│   ├── models/            # um arquivo por domínio (SQLAlchemy)
│   ├── schemas/           # um arquivo por domínio (Pydantic)
│   └── routers/            # um arquivo por domínio (endpoints)
├── alembic/               # migrations
├── seeds/seed.py           # dados fictícios iniciais
├── requirements.txt
└── .env.example
```

## Domínios implementados

| Domínio | Endpoints principais |
|---|---|
| Autenticação | `POST /auth/login`, `GET /auth/me` |
| Usuários / Perfis / Permissões | `/usuarios`, `/perfis` |
| Clientes | `/clientes` |
| Equipes | `/equipes`, `/equipes/{id}/membros` |
| Obras | `/obras` (compatível com `src/lib/api.ts`) |
| Programação de obras | `/programacao` |
| Estoque / Almoxarifado | `/materiais`, `/almoxarifados`, `/estoque` |
| Fornecedores / Compras | `/fornecedores`, `/requisicoes-compra`, `/pedidos-compra` |
| Medições / Faturas / Pagamentos / Cobrança | `/medicoes`, `/faturas`, `/pagamentos`, `/cobranca/resumo` |
| Auditoria | `/auditoria` |
| Parâmetros globais | `/parametros` |
| Automações (genérico + rede elétrica) | `/automacoes`, `/automacao/painel`, `/automacao/self-healing/indicadores`, `/subestacoes/{id}/status`, `/vegetacao/pontos-criticos` |
| Dashboard / Relatórios | `/dashboard`, `/relatorios/resumo-diario` |

Todas as rotas (exceto `/auth/login`, `/`, `/saude`, `/docs`) exigem um
token JWT (`Authorization: Bearer <token>`) e checam a permissão do perfil
do usuário logado.

## Rodando localmente

### 1. Pré-requisitos

- Python 3.11+
- PostgreSQL 14+ rodando localmente (ou um container Docker)

### 2. Criar o banco

```bash
# Exemplo usando psql
createdb eletrogestor
createuser eletrogestor --pwprompt   # defina a senha "eletrogestor" (ou outra — ajuste o .env depois)
```

Ou via Docker:

```bash
docker run --name eletrogestor-db -e POSTGRES_USER=eletrogestor \
  -e POSTGRES_PASSWORD=eletrogestor -e POSTGRES_DB=eletrogestor \
  -p 5432:5432 -d postgres:16
```

### 3. Ambiente Python

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Variáveis de ambiente

```bash
cp .env.example .env
# edite o .env se a sua DATABASE_URL/senha forem diferentes do padrão
```

### 5. Rodar as migrations

```bash
alembic upgrade head
```

### 6. Popular dados iniciais (seed)

```bash
PYTHONPATH=. python seeds/seed.py
```

Isso cria os 21 perfis do sistema, um usuário administrador padrão
(`admin` / `admin123` — **troque essa senha antes de qualquer uso real**),
clientes/equipes/obras/medições/faturas fictícios compatíveis com os mocks
do frontend, e alguns parâmetros globais e dados de automação.

### 7. Subir a API

```bash
uvicorn app.main:app --reload --port 8000
```

A API sobe em `http://localhost:8000`. Documentação interativa (Swagger)
em `http://localhost:8000/docs`.

### 8. Conectar o frontend

No diretório raiz do projeto (frontend), crie/edite o `.env` com:

```
VITE_API_URL=http://localhost:8000
```

## Criando uma nova migration

Sempre que alterar um modelo em `app/models/`:

```bash
alembic revision --autogenerate -m "descricao da mudanca"
alembic upgrade head
```

Revise sempre o arquivo gerado antes de aplicar — o autogenerate não é
perfeito (ex.: não detecta mudanças de `server_default` de forma
confiável).

## Segurança

- Nenhuma chave, senha ou dado real está no código — tudo vem do `.env`
  (que **não é commitado**, veja `.gitignore`).
- Gere uma `JWT_SECRET_KEY` forte antes de ir para produção:
  ```bash
  python -c "import secrets; print(secrets.token_hex(32))"
  ```
- O usuário `admin` criado pelo seed é apenas para desenvolvimento local —
  troque a senha (ou remova o usuário) antes de qualquer deploy real.

## Permissões (RBAC)

Cada perfil (`perfis.id`) tem uma lista `permissoes` (JSON) com chaves no
formato `dominio:acao` (ex.: `obras:write`). O perfil `"*"` equivale a
acesso total. Os 21 perfis do frontend (`src/data/perfis.ts`) já vêm
populados pelo seed com um conjunto inicial de permissões — ajuste
conforme a regra de negócio de cada área evoluir.

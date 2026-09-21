"""Reune todos os modelos para que Base.metadata os enxergue (Alembic autogenerate)."""
from app.models.auditoria import AuditLog  # noqa: F401
from app.models.automacao import (  # noqa: F401
    Automacao,
    EventoSelfHealing,
    LeituraSubestacao,
    PontoVegetacao,
    Subestacao,
)
from app.models.cliente import Cliente  # noqa: F401
from app.models.compras import (  # noqa: F401
    Fornecedor,
    PedidoCompra,
    PedidoCompraItem,
    RequisicaoCompra,
    RequisicaoCompraItem,
)
from app.models.equipe import Equipe, EquipeMembro  # noqa: F401
from app.models.estoque import Almoxarifado, EstoqueItem, Material, MovimentacaoEstoque  # noqa: F401
from app.models.financeiro import Fatura, Medicao, Pagamento  # noqa: F401
from app.models.obra import HistoricoStatusObra, Obra, Programacao  # noqa: F401
from app.models.parametro import ParametroGlobal  # noqa: F401
from app.models.usuario import Perfil, RefreshToken, Usuario  # noqa: F401

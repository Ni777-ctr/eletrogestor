from datetime import date

from app.schemas.base import OrmModel


class MedicaoCreate(OrmModel):
    obra_id: int
    contrato: float
    percentual: float = 0
    responsavel_usuario_id: int | None = None
    status: str = "Rascunho"
    dias_parada: int = 0


class MedicaoUpdate(OrmModel):
    percentual: float | None = None
    status: str | None = None
    dias_parada: int | None = None


class MedicaoOut(OrmModel):
    id: int
    obra_id: int
    contrato: float
    percentual: float
    responsavel_usuario_id: int | None = None
    status: str
    dias_parada: int


class FaturaCreate(OrmModel):
    obra_id: int
    medicao_id: int | None = None
    valor: float
    vencimento: date
    status: str = "Emitida"
    percentual_faturado: float | None = None
    percentual_pago: float | None = None


class FaturaUpdate(OrmModel):
    status: str | None = None
    percentual_faturado: float | None = None
    percentual_pago: float | None = None


class FaturaOut(OrmModel):
    id: int
    obra_id: int
    medicao_id: int | None = None
    valor: float
    vencimento: date
    status: str
    dias_atraso: int = 0  # calculado no router
    percentual_faturado: float | None = None
    percentual_pago: float | None = None


class PagamentoCreate(OrmModel):
    fatura_id: int
    valor: float
    data_pagamento: date
    metodo: str | None = None


class PagamentoOut(OrmModel):
    id: int
    fatura_id: int
    valor: float
    data_pagamento: date
    metodo: str | None = None


class ResumoCobranca(OrmModel):
    recuperacao_percentual: float
    tempo_medio_dias: float
    valor_pendente: float
    valor_pago: float
    faixas_atraso: dict  # {"ate_10": n, "11_a_30": n, "acima_30": n}

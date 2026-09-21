"""Obras e programacao (agenda de execucao)."""
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Obra(Base):
    __tablename__ = "obras"

    id: Mapped[int] = mapped_column(primary_key=True)
    wl: Mapped[str] = mapped_column(String(40), unique=True, nullable=False, index=True)  # codigo da obra
    descricao: Mapped[str | None] = mapped_column(String(255), nullable=True)
    regional: Mapped[str | None] = mapped_column(String(60), nullable=True)
    cliente_id: Mapped[int | None] = mapped_column(ForeignKey("clientes.id"), nullable=True)
    equipe_id: Mapped[int | None] = mapped_column(ForeignKey("equipes.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="proposta")
    # proposta | contratada | em_execucao | concluida | cancelada
    valor_contrato: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    custo_previsto: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    custo_realizado: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    avanco_previsto: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    avanco_realizado: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    necs_planejados: Mapped[int] = mapped_column(default=0)
    necs_executados: Mapped[int] = mapped_column(default=0)
    dias_contratada: Mapped[int | None] = mapped_column(nullable=True)
    data_inicio: Mapped[date | None] = mapped_column(Date, nullable=True)
    data_fim: Mapped[date | None] = mapped_column(Date, nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    cliente: Mapped["Cliente | None"] = relationship()
    equipe: Mapped["Equipe | None"] = relationship()

    # Obra como entidade central: todos os modulos que pertencem a uma obra
    # sao acessiveis a partir dela (sem duplicar dados -- FK de volta para ca).
    programacoes: Mapped[list["Programacao"]] = relationship(back_populates="obra")
    medicoes: Mapped[list["Medicao"]] = relationship(back_populates="obra")
    faturas: Mapped[list["Fatura"]] = relationship(back_populates="obra")
    requisicoes_compra: Mapped[list["RequisicaoCompra"]] = relationship(back_populates="obra")
    movimentacoes_estoque: Mapped[list["MovimentacaoEstoque"]] = relationship(back_populates="obra")
    historico_status: Mapped[list["HistoricoStatusObra"]] = relationship(
        back_populates="obra", order_by="HistoricoStatusObra.criado_em.desc()"
    )


class HistoricoStatusObra(Base):
    """Trilha dedicada das mudancas de status da obra (complementa o AuditLog
    generico com uma consulta direta por obra)."""

    __tablename__ = "historico_status_obra"

    id: Mapped[int] = mapped_column(primary_key=True)
    obra_id: Mapped[int] = mapped_column(ForeignKey("obras.id"), nullable=False, index=True)
    status_anterior: Mapped[str | None] = mapped_column(String(20), nullable=True)
    status_novo: Mapped[str] = mapped_column(String(20), nullable=False)
    usuario_id: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id"), nullable=True)
    observacao: Mapped[str | None] = mapped_column(String(255), nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    obra: Mapped["Obra"] = relationship(back_populates="historico_status")


class Programacao(Base):
    """Programacao diaria de obras/equipes."""

    __tablename__ = "programacoes"

    id: Mapped[int] = mapped_column(primary_key=True)
    obra_id: Mapped[int] = mapped_column(ForeignKey("obras.id"), nullable=False)
    equipe_id: Mapped[int] = mapped_column(ForeignKey("equipes.id"), nullable=False)
    data: Mapped[date] = mapped_column(Date, nullable=False)
    turno: Mapped[str] = mapped_column(String(20), default="Diurno")
    status: Mapped[str] = mapped_column(String(20), default="Programada")
    # Programada | Em execucao | Concluida | Cancelada
    observacoes: Mapped[str | None] = mapped_column(Text, nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    obra: Mapped["Obra"] = relationship(back_populates="programacoes")
    equipe: Mapped["Equipe"] = relationship()

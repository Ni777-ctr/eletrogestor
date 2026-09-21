"""Medicoes, faturas e pagamentos (faturamento/cobranca)."""
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Medicao(Base):
    __tablename__ = "medicoes"

    id: Mapped[int] = mapped_column(primary_key=True)
    obra_id: Mapped[int] = mapped_column(ForeignKey("obras.id"), nullable=False)
    contrato: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    percentual: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    responsavel_usuario_id: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="Rascunho")  # Rascunho | Aprovada | Reprovada
    dias_parada: Mapped[int] = mapped_column(default=0)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    obra: Mapped["Obra"] = relationship(back_populates="medicoes")


class Fatura(Base):
    __tablename__ = "faturas"

    id: Mapped[int] = mapped_column(primary_key=True)
    obra_id: Mapped[int] = mapped_column(ForeignKey("obras.id"), nullable=False)
    medicao_id: Mapped[int | None] = mapped_column(ForeignKey("medicoes.id"), nullable=True)
    valor: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    vencimento: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="Emitida")  # Emitida | Paga | Atrasada
    percentual_faturado: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    percentual_pago: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    obra: Mapped["Obra"] = relationship(back_populates="faturas")
    pagamentos: Mapped[list["Pagamento"]] = relationship(back_populates="fatura", cascade="all, delete-orphan")


class Pagamento(Base):
    __tablename__ = "pagamentos"

    id: Mapped[int] = mapped_column(primary_key=True)
    fatura_id: Mapped[int] = mapped_column(ForeignKey("faturas.id"), nullable=False)
    valor: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    data_pagamento: Mapped[date] = mapped_column(Date, nullable=False)
    metodo: Mapped[str | None] = mapped_column(String(40), nullable=True)  # Boleto | Pix | Transferencia
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    fatura: Mapped["Fatura"] = relationship(back_populates="pagamentos")

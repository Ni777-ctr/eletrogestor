from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import requer_permissao
from app.models.financeiro import Fatura, Medicao, Pagamento
from app.schemas.financeiro import (
    FaturaCreate,
    FaturaOut,
    FaturaUpdate,
    MedicaoCreate,
    MedicaoOut,
    MedicaoUpdate,
    PagamentoCreate,
    PagamentoOut,
    ResumoCobranca,
)

router = APIRouter(tags=["Medicoes, Faturas e Cobranca"])


# ---------- Medicoes ----------
@router.get("/medicoes", response_model=list[MedicaoOut])
def listar_medicoes(db: Session = Depends(get_db), _=Depends(requer_permissao("financeiro:read"))):
    return db.query(Medicao).order_by(Medicao.criado_em.desc()).all()


@router.post("/medicoes", response_model=MedicaoOut, status_code=status.HTTP_201_CREATED)
def criar_medicao(dados: MedicaoCreate, db: Session = Depends(get_db), _=Depends(requer_permissao("financeiro:write"))):
    medicao = Medicao(**dados.model_dump())
    db.add(medicao)
    db.commit()
    db.refresh(medicao)
    return medicao


@router.patch("/medicoes/{medicao_id}", response_model=MedicaoOut)
def atualizar_medicao(
    medicao_id: int, dados: MedicaoUpdate, db: Session = Depends(get_db), _=Depends(requer_permissao("financeiro:write"))
):
    medicao = db.get(Medicao, medicao_id)
    if not medicao:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medicao nao encontrada.")
    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(medicao, campo, valor)
    db.commit()
    db.refresh(medicao)
    return medicao


# ---------- Faturas ----------
def _serializar_fatura(fatura: Fatura) -> FaturaOut:
    saida = FaturaOut.model_validate(fatura)
    if fatura.status != "Paga" and fatura.vencimento < date.today():
        saida.dias_atraso = (date.today() - fatura.vencimento).days
    else:
        saida.dias_atraso = 0
    return saida


@router.get("/faturas", response_model=list[FaturaOut])
def listar_faturas(db: Session = Depends(get_db), _=Depends(requer_permissao("financeiro:read"))):
    return [_serializar_fatura(f) for f in db.query(Fatura).order_by(Fatura.vencimento).all()]


@router.post("/faturas", response_model=FaturaOut, status_code=status.HTTP_201_CREATED)
def criar_fatura(dados: FaturaCreate, db: Session = Depends(get_db), _=Depends(requer_permissao("financeiro:write"))):
    fatura = Fatura(**dados.model_dump())
    db.add(fatura)
    db.commit()
    db.refresh(fatura)
    return _serializar_fatura(fatura)


@router.patch("/faturas/{fatura_id}", response_model=FaturaOut)
def atualizar_fatura(
    fatura_id: int, dados: FaturaUpdate, db: Session = Depends(get_db), _=Depends(requer_permissao("financeiro:write"))
):
    fatura = db.get(Fatura, fatura_id)
    if not fatura:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fatura nao encontrada.")
    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(fatura, campo, valor)
    db.commit()
    db.refresh(fatura)
    return _serializar_fatura(fatura)


# ---------- Pagamentos ----------
@router.get("/pagamentos", response_model=list[PagamentoOut])
def listar_pagamentos(db: Session = Depends(get_db), _=Depends(requer_permissao("financeiro:read"))):
    return db.query(Pagamento).order_by(Pagamento.data_pagamento.desc()).all()


@router.post("/pagamentos", response_model=PagamentoOut, status_code=status.HTTP_201_CREATED)
def registrar_pagamento(
    dados: PagamentoCreate, db: Session = Depends(get_db), _=Depends(requer_permissao("financeiro:write"))
):
    fatura = db.get(Fatura, dados.fatura_id)
    if not fatura:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fatura nao encontrada.")
    pagamento = Pagamento(**dados.model_dump())
    db.add(pagamento)

    total_pago = sum(p.valor for p in fatura.pagamentos) + dados.valor
    if total_pago >= float(fatura.valor):
        fatura.status = "Paga"
        fatura.percentual_pago = 100
    else:
        fatura.percentual_pago = round((total_pago / float(fatura.valor)) * 100, 2)

    db.commit()
    db.refresh(pagamento)
    return pagamento


# ---------- Cobranca (resumo) ----------
@router.get("/cobranca/resumo", response_model=ResumoCobranca)
def resumo_cobranca(db: Session = Depends(get_db), _=Depends(requer_permissao("financeiro:read"))):
    faturas = db.query(Fatura).all()
    hoje = date.today()

    atrasadas = [f for f in faturas if f.status != "Paga" and f.vencimento < hoje]
    pagas = [f for f in faturas if f.status == "Paga"]
    recuperadas = [f for f in pagas if f.vencimento < hoje]  # pagas que estiveram vencidas

    recuperacao = (len(recuperadas) / (len(recuperadas) + len(atrasadas)) * 100) if (recuperadas or atrasadas) else 0.0
    pendente = sum(float(f.valor) for f in faturas if f.status != "Paga")
    pago = sum(float(f.valor) for f in pagas)

    faixas = {"ate_10": 0, "11_a_30": 0, "acima_30": 0}
    for f in atrasadas:
        dias = (hoje - f.vencimento).days
        if dias <= 10:
            faixas["ate_10"] += 1
        elif dias <= 30:
            faixas["11_a_30"] += 1
        else:
            faixas["acima_30"] += 1

    return ResumoCobranca(
        recuperacao_percentual=round(recuperacao, 2),
        tempo_medio_dias=7,
        valor_pendente=pendente,
        valor_pago=pago,
        faixas_atraso=faixas,
    )

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..dependencias import exige_editor

router = APIRouter(prefix="/cartas", tags=["cartas"])


@router.get("", response_model=list[schemas.CartaOut])
def listar_cartas(
    db: Session = Depends(get_db),
    status_: Optional[models.StatusCarta] = Query(None, alias="status"),
    busca: Optional[str] = Query(None, description="Busca por assinante ou trecho da carta"),
):
    query = db.query(models.Carta)
    if status_:
        query = query.filter(models.Carta.status == status_)
    if busca:
        termo = f"%{busca}%"
        query = query.filter(
            (models.Carta.assinante_nome.ilike(termo)) | (models.Carta.texto.ilike(termo))
        )
    return query.order_by(models.Carta.criado_em.desc()).all()


@router.patch("/{carta_id}", response_model=schemas.CartaOut)
def atualizar_carta(
    carta_id: int,
    dados: schemas.CartaUpdate,
    db: Session = Depends(get_db),
    editor: models.Usuario = Depends(exige_editor),
):
    # a redação não edita o texto da carta, só decide o status
    # (pendente -> aprovada/recusada) — é isso que a tela de moderação faz.
    carta = db.get(models.Carta, carta_id)
    if not carta:
        raise HTTPException(status_code=404, detail="Carta não encontrada")
    carta.status = dados.status
    db.commit()
    db.refresh(carta)
    return carta

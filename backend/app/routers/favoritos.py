from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..dependencias import usuario_autenticado
from ..utils import com_contagens

router = APIRouter(prefix="/favoritos", tags=["favoritos"])


@router.get("", response_model=list[schemas.ConteudoOut])
def listar_meus_favoritos(
    usuario: models.Usuario = Depends(usuario_autenticado),
    db: Session = Depends(get_db),
):
    # usado pelo app mobile (e futuramente uma tela "salvos" no site) pra
    # trazer os conteúdos favoritados pela conta logada.
    conteudos = (
        db.query(models.Conteudo)
        .join(models.Favorito, models.Favorito.conteudo_id == models.Conteudo.id)
        .filter(models.Favorito.usuario_id == usuario.id)
        .all()
    )
    return [com_contagens(db, c) for c in conteudos]


@router.post("", response_model=schemas.FavoritoOut, status_code=201)
def favoritar(
    dados: schemas.FavoritoCreate,
    usuario: models.Usuario = Depends(usuario_autenticado),
    db: Session = Depends(get_db),
):
    if not db.get(models.Conteudo, dados.conteudo_id):
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")

    # favoritar de novo não duplica — devolve o que já existia (idempotente).
    existente = (
        db.query(models.Favorito)
        .filter_by(conteudo_id=dados.conteudo_id, usuario_id=usuario.id)
        .first()
    )
    if existente:
        return existente

    favorito = models.Favorito(conteudo_id=dados.conteudo_id, usuario_id=usuario.id)
    db.add(favorito)
    db.commit()
    db.refresh(favorito)
    return favorito


@router.delete("/{conteudo_id}", status_code=204)
def desfavoritar(
    conteudo_id: int,
    usuario: models.Usuario = Depends(usuario_autenticado),
    db: Session = Depends(get_db),
):
    favorito = (
        db.query(models.Favorito)
        .filter_by(conteudo_id=conteudo_id, usuario_id=usuario.id)
        .first()
    )
    if favorito:
        db.delete(favorito)
        db.commit()
    return None

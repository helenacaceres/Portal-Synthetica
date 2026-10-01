from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..dependencias import usuario_autenticado

router = APIRouter(tags=["comentarios"])


@router.get("/conteudos/{conteudo_id}/comentarios", response_model=list[schemas.ComentarioOut])
def listar_comentarios(conteudo_id: int, db: Session = Depends(get_db)):
    if not db.get(models.Conteudo, conteudo_id):
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")
    return (
        db.query(models.Comentario)
        .filter(models.Comentario.conteudo_id == conteudo_id)
        .order_by(models.Comentario.criado_em.desc())
        .all()
    )


@router.post(
    "/conteudos/{conteudo_id}/comentarios",
    response_model=schemas.ComentarioOut,
    status_code=201,
)
def comentar(
    conteudo_id: int,
    dados: schemas.ComentarioCreate,
    usuario: models.Usuario = Depends(usuario_autenticado),
    db: Session = Depends(get_db),
):
    if not db.get(models.Conteudo, conteudo_id):
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")
    comentario = models.Comentario(
        conteudo_id=conteudo_id, usuario_id=usuario.id, texto=dados.texto
    )
    db.add(comentario)
    db.commit()
    db.refresh(comentario)
    return comentario


@router.delete("/comentarios/{comentario_id}", status_code=204)
def apagar_comentario(
    comentario_id: int,
    usuario: models.Usuario = Depends(usuario_autenticado),
    db: Session = Depends(get_db),
):
    comentario = db.get(models.Comentario, comentario_id)
    if not comentario:
        return None
    # dono do comentário ou editor podem apagar; qualquer outra conta, não.
    if comentario.usuario_id != usuario.id and usuario.papel != "editor":
        raise HTTPException(status_code=403, detail="Sem permissão para apagar este comentário")
    db.delete(comentario)
    db.commit()
    return None

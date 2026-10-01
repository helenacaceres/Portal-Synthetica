from sqlalchemy import func
from sqlalchemy.orm import Session

from . import models


# conta na hora em vez de guardar no Conteudo, senão desatualiza a cada
# comentário/favorito novo.
def com_contagens(db: Session, conteudo: models.Conteudo) -> models.Conteudo:
    conteudo.total_comentarios = (
        db.query(func.count(models.Comentario.id))
        .filter(models.Comentario.conteudo_id == conteudo.id)
        .scalar()
    )
    conteudo.total_favoritos = (
        db.query(func.count(models.Favorito.id))
        .filter(models.Favorito.conteudo_id == conteudo.id)
        .scalar()
    )
    return conteudo

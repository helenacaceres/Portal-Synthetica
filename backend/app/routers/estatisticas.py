from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..dependencias import exige_editor

router = APIRouter(prefix="/estatisticas", tags=["estatisticas"])


@router.get("", response_model=schemas.EstatisticasOut, dependencies=[Depends(exige_editor)])
def obter_estatisticas(db: Session = Depends(get_db)):
    # alimenta o painel da redação com números de verdade, no lugar do
    # texto fixo de "atividade recente" que tinha antes.
    por_editoria = (
        db.query(models.Editoria.nome, func.count(models.Conteudo.id))
        .join(models.Conteudo, models.Conteudo.editoria_id == models.Editoria.id)
        .filter(models.Conteudo.status == models.StatusConteudo.PUBLICADO)
        .group_by(models.Editoria.nome)
        .all()
    )

    mais_comentados = (
        db.query(
            models.Conteudo.id,
            models.Conteudo.titulo,
            func.count(models.Comentario.id).label("total"),
        )
        .outerjoin(models.Comentario)
        .group_by(models.Conteudo.id)
        .order_by(func.count(models.Comentario.id).desc())
        .limit(5)
        .all()
    )

    usuarios_ativos = (
        db.query(
            models.Usuario.id,
            models.Usuario.nome,
            func.count(models.Comentario.id).label("total"),
        )
        .join(models.Comentario, models.Comentario.usuario_id == models.Usuario.id)
        .group_by(models.Usuario.id)
        .order_by(func.count(models.Comentario.id).desc())
        .limit(5)
        .all()
    )

    return schemas.EstatisticasOut(
        conteudos_por_editoria=[
            schemas.EstatisticaEditoria(editoria=nome, total=total) for nome, total in por_editoria
        ],
        mais_comentados=[
            schemas.EstatisticaConteudo(id=i, titulo=titulo, total_comentarios=total)
            for i, titulo, total in mais_comentados
        ],
        usuarios_mais_ativos=[
            schemas.EstatisticaUsuario(id=i, nome=nome, total_comentarios=total)
            for i, nome, total in usuarios_ativos
        ],
    )

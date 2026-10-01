from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..dependencias import exige_editor
from ..utils import com_contagens

router = APIRouter(tags=["conteudos"])


@router.get("/categorias", response_model=list[schemas.CategoriaOut])
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(models.Categoria).all()


@router.get("/editorias", response_model=list[schemas.EditoriaOut])
def listar_editorias(db: Session = Depends(get_db)):
    return db.query(models.Editoria).all()


# --- CRUD de Conteúdo (a entrega da disciplina) ---


@router.get("/conteudos", response_model=schemas.ConteudoListaOut)
def listar_conteudos(
    db: Session = Depends(get_db),
    busca: Optional[str] = Query(None, description="Filtra por título"),
    editoria: Optional[str] = Query(None, description="AVANÇOS, CULTURA, ÉTICA, MEMÓRIA"),
    status_: Optional[models.StatusConteudo] = Query(None, alias="status"),
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(100, ge=1, le=200),
    ordenar: str = Query("recentes", description="recentes, mais_comentados ou titulo"),
):
    # READ: sem nenhum filtro passado, devolve tudo (usado pelo painel);
    # com "status=publicado", devolve só o que o leitor pode ver. A resposta
    # vem paginada — por_pagina alto o bastante pra quem só quer "tudo de
    # uma vez" (Home, Leitor) não precisar mudar nada.
    query = db.query(models.Conteudo)
    if busca:
        query = query.filter(models.Conteudo.titulo.ilike(f"%{busca}%"))
    if editoria:
        query = query.join(models.Editoria).filter(
            func.lower(models.Editoria.nome) == editoria.lower()
        )
    if status_:
        query = query.filter(models.Conteudo.status == status_)

    total = query.count()

    if ordenar == "mais_comentados":
        query = (
            query.outerjoin(models.Comentario)
            .group_by(models.Conteudo.id)
            .order_by(func.count(models.Comentario.id).desc())
        )
    elif ordenar == "titulo":
        query = query.order_by(models.Conteudo.titulo.asc())
    else:
        query = query.order_by(models.Conteudo.atualizado_em.desc())

    itens = query.offset((pagina - 1) * por_pagina).limit(por_pagina).all()
    total_paginas = max(1, (total + por_pagina - 1) // por_pagina)

    return schemas.ConteudoListaOut(
        itens=[com_contagens(db, c) for c in itens],
        total=total,
        pagina=pagina,
        por_pagina=por_pagina,
        total_paginas=total_paginas,
    )


@router.get("/conteudos/{conteudo_id}", response_model=schemas.ConteudoOut)
def obter_conteudo(conteudo_id: int, db: Session = Depends(get_db)):
    # READ de um item só — é essa rota que a tela de Leitura chama pra abrir
    # a matéria pelo id que veio na URL (/leitura/:id).
    conteudo = db.get(models.Conteudo, conteudo_id)
    if not conteudo:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")
    return com_contagens(db, conteudo)


@router.post("/conteudos", response_model=schemas.ConteudoOut, status_code=201)
def criar_conteudo(
    dados: schemas.ConteudoCreate,
    db: Session = Depends(get_db),
    editor: models.Usuario = Depends(exige_editor),
):
    # CREATE: exige token de editor (ver exige_editor) e valida a editoria
    # antes de gravar, senão o FK ficaria apontando pra um id inexistente.
    editoria = db.get(models.Editoria, dados.editoria_id)
    if not editoria:
        raise HTTPException(status_code=400, detail="Editoria inválida")

    autor_id = dados.autor_id
    if autor_id is not None and not db.get(models.Usuario, autor_id):
        raise HTTPException(status_code=400, detail="Autor inválido")
    if not autor_id:
        # sem autor explícito: assina com a conta do editor logado.
        autor_id = editor.id

    conteudo = models.Conteudo(
        titulo=dados.titulo,
        chamada=dados.chamada,
        corpo=dados.corpo,
        editoria_id=dados.editoria_id,
        pagina=dados.pagina,
        tempo_leitura_min=dados.tempo_leitura_min,
        palavra_chave=dados.palavra_chave,
        imagem_url=dados.imagem_url,
        status=dados.status,
        autor_id=autor_id,
    )
    db.add(conteudo)
    db.commit()
    db.refresh(conteudo)
    return com_contagens(db, conteudo)


@router.put("/conteudos/{conteudo_id}", response_model=schemas.ConteudoOut)
@router.patch("/conteudos/{conteudo_id}", response_model=schemas.ConteudoOut)
def atualizar_conteudo(
    conteudo_id: int,
    dados: schemas.ConteudoUpdate,
    db: Session = Depends(get_db),
    editor: models.Usuario = Depends(exige_editor),
):
    # PUT e PATCH caem na mesma função — com exclude_unset os dois se
    # comportam como PATCH (só muda o que veio no corpo).
    conteudo = db.get(models.Conteudo, conteudo_id)
    if not conteudo:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")

    campos = dados.model_dump(exclude_unset=True)

    if campos.get("editoria_id") is not None and not db.get(models.Editoria, campos["editoria_id"]):
        raise HTTPException(status_code=400, detail="Editoria inválida")
    if campos.get("autor_id") is not None and not db.get(models.Usuario, campos["autor_id"]):
        raise HTTPException(status_code=400, detail="Autor inválido")

    for campo, valor in campos.items():
        setattr(conteudo, campo, valor)

    db.commit()
    db.refresh(conteudo)
    return com_contagens(db, conteudo)


@router.delete("/conteudos/{conteudo_id}", status_code=204)
def excluir_conteudo(
    conteudo_id: int,
    db: Session = Depends(get_db),
    editor: models.Usuario = Depends(exige_editor),
):
    # DELETE — 204 sem corpo, como o front (ConfirmarExclusaoModal) espera.
    conteudo = db.get(models.Conteudo, conteudo_id)
    if not conteudo:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")
    # Cartas apontam pro conteúdo por FK nullable — solta a referência antes
    # de apagar pra não deixar carta órfã (SQLite não força FK aqui).
    db.query(models.Carta).filter(models.Carta.conteudo_id == conteudo_id).update(
        {models.Carta.conteudo_id: None}
    )
    db.delete(conteudo)
    db.commit()
    return None

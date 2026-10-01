from typing import Optional

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from . import models
from .database import get_db


# token opaco salvo na própria tabela de usuários, sem JWT.
def usuario_autenticado(
    authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
) -> models.Usuario:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Não autenticado")
    token = authorization.split(" ", 1)[1].strip()
    usuario = db.query(models.Usuario).filter(models.Usuario.token == token).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Sessão inválida")
    return usuario


def exige_editor(usuario: models.Usuario = Depends(usuario_autenticado)) -> models.Usuario:
    """Autorização de verdade (não é esconder botão no front): CRUD de
    conteúdo, moderação de carta e estatísticas só com token de conta `editor`."""
    if usuario.papel != "editor":
        raise HTTPException(status_code=403, detail="Acesso restrito à equipe editorial")
    return usuario

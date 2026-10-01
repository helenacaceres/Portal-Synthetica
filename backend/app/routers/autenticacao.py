from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import auth, models, schemas
from ..database import get_db
from ..dependencias import usuario_autenticado

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/cadastro", response_model=schemas.SessaoOut, status_code=201)
def cadastrar(dados: schemas.CadastroIn, db: Session = Depends(get_db)):
    # já devolve token pra logar automático (cai direto na Ficha do assinante).
    if db.query(models.Usuario).filter(models.Usuario.email == dados.email).first():
        raise HTTPException(status_code=409, detail="Já existe uma conta com esse e-mail")
    if len(dados.senha) < 8:
        raise HTTPException(status_code=400, detail="A senha precisa ter pelo menos 8 caracteres")

    prefs = dados.preferencias
    nome = dados.nome.strip() if dados.nome and dados.nome.strip() else dados.email.split("@")[0].upper()
    usuario = models.Usuario(
        nome=nome,
        email=dados.email,
        papel="assinante",
        senha_hash=auth.gerar_hash_senha(dados.senha),
        token=auth.gerar_token(),
        proporcao_avancos=prefs.proporcao_avancos if prefs else None,
        temas=",".join(prefs.temas) if prefs and prefs.temas else None,
        perfil=prefs.perfil if prefs else None,
        tempo=prefs.tempo if prefs else None,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return schemas.SessaoOut(token=usuario.token, assinante=usuario)


@router.post("/login", response_model=schemas.SessaoOut)
def entrar(dados: schemas.LoginIn, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.email == dados.email).first()
    if not usuario or not usuario.senha_hash or not auth.verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")
    # gera um token novo a cada login, assim um token antigo vazado para de
    # funcionar depois que o dono loga de novo.
    usuario.token = auth.gerar_token()
    db.commit()
    db.refresh(usuario)
    return schemas.SessaoOut(token=usuario.token, assinante=usuario)


@router.get("/eu", response_model=schemas.AssinanteOut)
def eu(usuario: models.Usuario = Depends(usuario_autenticado)):
    # usado pelo SessaoContext do front (e pelo login do mobile) pra saber
    # quem está logado assim que a tela carrega.
    return usuario


@router.patch("/preferencias", response_model=schemas.AssinanteOut)
def atualizar_preferencias(
    dados: schemas.PreferenciasOnboarding,
    usuario: models.Usuario = Depends(usuario_autenticado),
    db: Session = Depends(get_db),
):
    # cada campo só é alterado se vier preenchido — permite a Ficha de
    # Assinatura mandar só o que o usuário respondeu naquele passo do wizard.
    if dados.proporcao_avancos is not None:
        usuario.proporcao_avancos = dados.proporcao_avancos
    if dados.temas is not None:
        usuario.temas = ",".join(dados.temas)
    if dados.perfil is not None:
        usuario.perfil = dados.perfil
    if dados.tempo is not None:
        usuario.tempo = dados.tempo
    db.commit()
    db.refresh(usuario)
    return usuario


@router.delete("/preferencias/{campo}", response_model=schemas.AssinanteOut)
def apagar_sinal(
    campo: str,
    usuario: models.Usuario = Depends(usuario_autenticado),
    db: Session = Depends(get_db),
):
    # a Ficha do assinante deixa apagar cada "sinal" usado na curadoria
    # individualmente — aqui é só zerar o campo específico, não a conta toda.
    campos_validos = {"proporcao_avancos", "temas", "perfil", "tempo"}
    if campo not in campos_validos:
        raise HTTPException(status_code=400, detail="Sinal desconhecido")
    setattr(usuario, campo, None)
    db.commit()
    db.refresh(usuario)
    return usuario

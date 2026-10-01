from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from .models import StatusCarta, StatusConteudo


class CategoriaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nome: str


class EditoriaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nome: str
    categoria_id: int


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nome: str
    papel: str


# --- Conteúdo (o CRUD principal da entrega) ---


class ConteudoBase(BaseModel):
    titulo: str = Field(min_length=1)
    chamada: str = ""
    corpo: str = ""
    editoria_id: int
    pagina: Optional[int] = Field(default=None, ge=1)
    tempo_leitura_min: int = Field(default=5, ge=1)
    palavra_chave: str = ""
    imagem_url: Optional[str] = None
    status: StatusConteudo = StatusConteudo.RASCUNHO


class ConteudoCreate(ConteudoBase):
    autor_id: Optional[int] = None


class ConteudoUpdate(BaseModel):
    titulo: Optional[str] = Field(default=None, min_length=1)
    chamada: Optional[str] = None
    corpo: Optional[str] = None
    editoria_id: Optional[int] = None
    autor_id: Optional[int] = None
    pagina: Optional[int] = Field(default=None, ge=1)
    tempo_leitura_min: Optional[int] = Field(default=None, ge=1)
    palavra_chave: Optional[str] = None
    imagem_url: Optional[str] = None
    status: Optional[StatusConteudo] = None


class ConteudoOut(ConteudoBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    autor_id: int
    criado_em: datetime
    atualizado_em: datetime
    editoria: EditoriaOut
    autor: UsuarioOut
    total_comentarios: int = 0
    total_favoritos: int = 0


class ConteudoListaOut(BaseModel):
    itens: list[ConteudoOut]
    total: int
    pagina: int
    por_pagina: int
    total_paginas: int


# --- Favoritos --------------------------------------------------------------


class FavoritoCreate(BaseModel):
    conteudo_id: int


class FavoritoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    conteudo_id: int
    criado_em: datetime


# --- Comentários --------------------------------------------------------------


class ComentarioCreate(BaseModel):
    texto: str = Field(min_length=1)


class ComentarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    conteudo_id: int
    texto: str
    criado_em: datetime
    usuario: UsuarioOut


# --- Estatísticas (painel da redação) ---------------------------------------


class EstatisticaEditoria(BaseModel):
    editoria: str
    total: int


class EstatisticaConteudo(BaseModel):
    id: int
    titulo: str
    total_comentarios: int


class EstatisticaUsuario(BaseModel):
    id: int
    nome: str
    total_comentarios: int


class EstatisticasOut(BaseModel):
    conteudos_por_editoria: list[EstatisticaEditoria]
    mais_comentados: list[EstatisticaConteudo]
    usuarios_mais_ativos: list[EstatisticaUsuario]


# --- Cartas à redação -----------------------------------------------------


class CartaUpdate(BaseModel):
    status: StatusCarta


class CartaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    assinante_nome: str
    assinante_numero: str
    conteudo_id: Optional[int] = None
    assunto: str
    texto: str
    status: StatusCarta
    criado_em: datetime


# --- Auth / onboarding do assinante ---------------------------------------


class PreferenciasOnboarding(BaseModel):
    proporcao_avancos: Optional[int] = None
    temas: Optional[list[str]] = None
    perfil: Optional[str] = None
    tempo: Optional[str] = None


class CadastroIn(BaseModel):
    nome: Optional[str] = None
    email: str
    senha: str
    preferencias: Optional[PreferenciasOnboarding] = None


class LoginIn(BaseModel):
    email: str
    senha: str


class AssinanteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nome: str
    email: str
    papel: str
    proporcao_avancos: Optional[int] = None
    temas: Optional[str] = None
    perfil: Optional[str] = None
    tempo: Optional[str] = None


class SessaoOut(BaseModel):
    token: str
    assinante: AssinanteOut

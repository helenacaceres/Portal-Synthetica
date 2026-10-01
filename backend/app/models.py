import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime,
    Enum,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from .database import Base

# segue o mesmo MER da disciplina de Database Application.


class StatusConteudo(str, enum.Enum):
    RASCUNHO = "rascunho"
    PUBLICADO = "publicado"


class StatusCarta(str, enum.Enum):
    PENDENTE = "pendente"
    APROVADA = "aprovada"
    RECUSADA = "recusada"


class Usuario(Base):
    """Conta de login — assinante do leitor ou editor da redação, o campo `papel` distingue os dois."""

    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    email = Column(String(160), nullable=False, unique=True)
    papel = Column(String(40), nullable=False, default="editor")
    senha_hash = Column(String(200), nullable=True)
    token = Column(String(64), nullable=True, unique=True)
    criado_em = Column(DateTime, default=datetime.utcnow)

    # Sinais da Ficha de Assinatura (onboarding), usados na Home e na Ficha do assinante.
    proporcao_avancos = Column(Integer, nullable=True)
    temas = Column(String(300), nullable=True)
    perfil = Column(String(20), nullable=True)
    tempo = Column(String(20), nullable=True)

    conteudos = relationship("Conteudo", back_populates="autor")
    comentarios = relationship("Comentario", back_populates="usuario")
    favoritos = relationship("Favorito", back_populates="usuario")


class Categoria(Base):
    """As duas categorias-guarda-chuva definidas no desafio: Avanços Tecnológicos / IA na Arte e Cultura."""

    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(80), nullable=False, unique=True)

    editorias = relationship("Editoria", back_populates="categoria")


class Editoria(Base):
    """Subcategoria usada nos filtros do painel: Avanços, Cultura, Ética, Memória."""

    __tablename__ = "editorias"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(60), nullable=False, unique=True)
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=False)

    categoria = relationship("Categoria", back_populates="editorias")
    conteudos = relationship("Conteudo", back_populates="editoria")


class Conteudo(Base):
    """Uma matéria da revista — só o status PUBLICADO aparece pro leitor."""

    __tablename__ = "conteudos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    chamada = Column(String(300), nullable=False, default="")
    corpo = Column(Text, nullable=False, default="")
    editoria_id = Column(Integer, ForeignKey("editorias.id"), nullable=False)
    pagina = Column(Integer, nullable=True)
    tempo_leitura_min = Column(Integer, nullable=False, default=5)
    palavra_chave = Column(String(120), nullable=False, default="")
    imagem_url = Column(String(500), nullable=True)
    status = Column(
        Enum(StatusConteudo), nullable=False, default=StatusConteudo.RASCUNHO
    )
    autor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    editoria = relationship("Editoria", back_populates="conteudos")
    autor = relationship("Usuario", back_populates="conteudos")
    comentarios = relationship(
        "Comentario", back_populates="conteudo", cascade="all, delete-orphan"
    )
    favoritos = relationship(
        "Favorito", back_populates="conteudo", cascade="all, delete-orphan"
    )


class Comentario(Base):
    """Interação de um usuário com um conteúdo — sem tela de CRUD própria, só entra na contagem."""

    __tablename__ = "comentarios"

    id = Column(Integer, primary_key=True, index=True)
    conteudo_id = Column(Integer, ForeignKey("conteudos.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    texto = Column(Text, nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)

    conteudo = relationship("Conteudo", back_populates="comentarios")
    usuario = relationship("Usuario", back_populates="comentarios")


class Favorito(Base):
    """Um usuário salvando um conteúdo de interesse — UniqueConstraint evita duplicar."""

    __tablename__ = "favoritos"
    __table_args__ = (UniqueConstraint("conteudo_id", "usuario_id", name="uq_favorito_unico"),)

    id = Column(Integer, primary_key=True, index=True)
    conteudo_id = Column(Integer, ForeignKey("conteudos.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)

    conteudo = relationship("Conteudo", back_populates="favoritos")
    usuario = relationship("Usuario", back_populates="favoritos")


class Carta(Base):
    """Carta de um assinante à redação, ligada (opcionalmente) a um conteúdo específico."""

    __tablename__ = "cartas"

    id = Column(Integer, primary_key=True, index=True)
    assinante_nome = Column(String(80), nullable=False)
    assinante_numero = Column(String(20), nullable=False)
    conteudo_id = Column(Integer, ForeignKey("conteudos.id"), nullable=True)
    assunto = Column(String(200), nullable=False)
    texto = Column(Text, nullable=False)
    status = Column(Enum(StatusCarta), nullable=False, default=StatusCarta.PENDENTE)
    criado_em = Column(DateTime, default=datetime.utcnow)

    conteudo = relationship("Conteudo")

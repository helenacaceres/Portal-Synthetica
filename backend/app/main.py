import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import Base, engine
from .migracoes import aplicar_migracoes
from .routers import autenticacao, cartas, comentarios, conteudos, estatisticas, favoritos
from .seed import (
    seed_cartas_se_vazio,
    seed_corpo_rico_se_vazio,
    seed_imagens_se_vazio,
    seed_se_vazio,
    seed_senha_redacao_se_vazio,
)

# migracoes.py só faz ALTER TABLE ADD COLUMN, nunca apaga dado.
Base.metadata.create_all(bind=engine)
aplicar_migracoes(engine)

with Session(engine) as db:
    seed_se_vazio(db)
    seed_senha_redacao_se_vazio(db)
    seed_corpo_rico_se_vazio(db)
    seed_imagens_se_vazio(db)
    seed_cartas_se_vazio(db)

app = FastAPI(title="Synthetica API", version="1.0.0")

# Em dev libera o Vite (5173); em produção, já libera o domínio do Vercel
# como padrão. Dá pra sobrescrever com a variável CORS_ORIGINS se precisar.
_origens = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,"
    "https://portal-synthetica-framework-applica.vercel.app",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origens if o.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
)

# cada disciplina/área ganhou seu próprio módulo de rotas em routers/,
# em vez de tudo empilhado num arquivo só — dá pra mexer num sem esbarrar
# nos outros.
app.include_router(autenticacao.router)
app.include_router(conteudos.router)
app.include_router(cartas.router)
app.include_router(favoritos.router)
app.include_router(comentarios.router)
app.include_router(estatisticas.router)


@app.get("/")
def raiz():
    # só pra confirmar que a API está de pé (usado em teste manual / uptime).
    return {"servico": "Synthetica API", "status": "ok"}

# Portal Synthetica

![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688?logo=fastapi&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-CC2927?logo=sqlite&logoColor=white)

Ano 2047. Um editor-chefe artificial fecha uma edição diferente para cada assinante, cruzando quanto ele quer de **Avanços Tecnológicos** e quanto quer de **IA na Arte e Cultura** — e mostra, ao lado de cada matéria, o sinal de leitura que motivou a escolha. Nenhum texto é escrito por IA; a curadoria, sim.

Este repositório é a entrega da disciplina **Framework Application** do projeto interdisciplinar "O Mundo de Synthetica": um CRUD de conteúdos em FastAPI + React, com o portal do leitor completo por cima.

## Sumário

- [Stack](#stack)
- [Rodando localmente](#rodando-localmente)
- [Contas de teste](#contas-de-teste)
- [Rotas do frontend](#rotas-do-frontend)
- [Endpoints da API](#endpoints-da-api)
- [Modelo de dados](#modelo-de-dados)
- [Integração com Database Application](#integração-com-database-application)

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Vite, React Router, CSS Modules puro (sem Tailwind) |
| Backend | FastAPI + SQLAlchemy, autenticação por token próprio |
| Banco | SQLite (persistência real, não é dado simulado em memória) |

## Rodando localmente

### Backend

```bash
cd backend
python3 -m venv venv
venv/Scripts/python.exe -m pip install -r requirements.txt   # Windows
venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8000
```

API em `http://127.0.0.1:8000` (docs automáticas em `/docs`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App em `http://localhost:5173`.

## Contas de teste

O banco já vem semeado com dados de exemplo.

- **Redação (admin)** — `http://localhost:5173/admin/login`
  E-mail: `redacao@synthetica.app` · Senha: `redacao2047`
- **Leitor/assinante** — crie uma conta em `http://localhost:5173/cadastro` (passa antes pela Ficha de Assinatura em `/assinatura`).

O login da redação é **separado** do login do leitor: cada `Usuario.papel` (`"editor"` ou `"assinante"`) só acessa a área correspondente, e isso é checado no backend — não é só esconder botão no front.

## Rotas do frontend

| Área | Rota | O que é |
|---|---|---|
| Redação | `/admin/login` | Login da equipe editorial |
| Redação | `/admin/painel` | Dashboard |
| Redação | `/admin/conteudos` | CRUD de conteúdos |
| Redação | `/admin/cartas` | Moderação de cartas de assinantes |
| Leitor | `/assinatura` | Ficha de Assinatura (onboarding, 4 perguntas) |
| Leitor | `/cadastro`, `/login` | Cadastro e login do assinante |
| Leitor | `/assinante` | Ficha do assinante (sinais salvos, cada um pode ser apagado) |
| Leitor | `/capa`, `/home` | Capa da edição e Home com a agulha de duas faces |
| Leitor | `/sumario` | Sumário da edição |
| Leitor | `/leitura/:id` | Leitura de uma matéria |
| Leitor | `/checkout`, `/assinatura-confirmada`, `/cancelar-assinatura` | Fluxo de assinatura (sem processar pagamento real) |

## Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/conteudos` | Lista conteúdos (filtros: `busca`, `editoria`, `status`) |
| GET | `/conteudos/{id}` | Detalhe de um conteúdo |
| POST | `/conteudos` | Cria conteúdo *(exige token de editor)* |
| PUT/PATCH | `/conteudos/{id}` | Atualiza conteúdo *(exige token de editor)* |
| DELETE | `/conteudos/{id}` | Remove conteúdo *(exige token de editor)* |
| GET | `/editorias`, `/categorias` | Listas de apoio pro formulário |
| GET | `/cartas` | Lista cartas (filtros: `status`, `busca`) |
| PATCH | `/cartas/{id}` | Aprova/recusa uma carta |
| POST | `/auth/cadastro` | Cria conta de assinante (com os sinais da Ficha de Assinatura) |
| POST | `/auth/login` | Login (leitor ou redação — o front decide a área pelo `papel`) |
| GET | `/auth/eu` | Dados da conta autenticada (`Authorization: Bearer <token>`) |
| PATCH | `/auth/preferencias` | Atualiza sinais da ficha |
| DELETE | `/auth/preferencias/{campo}` | Apaga um sinal específico |

## Modelo de dados

- **Usuário** — autor/editor de conteúdo **ou** assinante (`papel`). Guarda autenticação (`senha_hash`, `token`) e os sinais coletados na Ficha de Assinatura (`proporcao_avancos`, `temas`, `perfil`, `tempo`).
- **Categoria** — as duas categorias do desafio (Avanços Tecnológicos / IA na Arte e Cultura).
- **Editoria** — subcategoria usada nos filtros do painel (Avanços, Cultura, Ética, Memória), ligada a uma Categoria.
- **Conteúdo** — a matéria em si (título, chamada, corpo, editoria, página, tempo de leitura, palavra-chave SEO, status).
- **Comentário** / **Favorito** — ligados a Conteúdo e Usuário, fecham o MER do desafio.
- **Carta** — mensagem de um assinante à redação (pendente/aprovada/recusada).

## Integração com Database Application

O backend já usa um banco relacional real (SQLite) via SQLAlchemy, não dado simulado em memória — pensado pra receber o MER definitivo da disciplina de Database Application sem reescrever a API:

1. **Trocar a engine** (Postgres/MySQL em vez de SQLite): só muda `SQLALCHEMY_DATABASE_URL` em `backend/app/database.py`. As rotas em `main.py` não mudam.
2. **Trocar/ajustar as tabelas**: os modelos ficam em `backend/app/models.py`, um por classe. Os schemas de entrada/saída da API ficam separados em `schemas.py` — dá pra ajustar o banco sem quebrar o formato que o frontend espera, desde que os campos usados continuem existindo (ver `frontend/src/api/client.js`).
3. Migrações simples (adicionar coluna sem apagar dado) ficam em `backend/app/migracoes.py`.
4. Os dados de exemplo (`backend/app/seed.py`) só populam se as tabelas estiverem vazias.

---

Projeto acadêmico — disciplina Framework Application, "O Mundo de Synthetica".

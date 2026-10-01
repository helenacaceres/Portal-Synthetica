import { lerTokenAdmin } from "../admin/sessaoAdmin";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// O CRUD de conteúdo e a moderação de carta exigem token de editor no
// backend. As telas da redação vivem dentro do AdminShell (que já validou o
// token); aqui só reanexamos esse token nas escritas do admin.
const tokenAdmin = lerTokenAdmin;

async function requisicao(caminho, opcoes = {}) {
  const { token, ...resto } = opcoes;
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...resto,
  });

  if (!resposta.ok) {
    // Sessão de editor expirou no meio de uma ação (logou em outro lugar,
    // token rotacionou): limpa e volta pro login em vez de deixar o admin
    // preso numa tela sem conseguir salvar nada.
    if (resposta.status === 401 && token && token === tokenAdmin()) {
      try {
        localStorage.removeItem("synthetica.admin.token");
      } catch {
        /* segue */
      }
      if (!window.location.pathname.startsWith("/admin/login")) {
        window.location.assign("/admin/login");
      }
    }
    const corpo = await resposta.json().catch(() => ({}));
    const erro = new Error(corpo.detail || `Erro ${resposta.status} em ${caminho}`);
    erro.status = resposta.status;
    throw erro;
  }

  if (resposta.status === 204) return null;
  return resposta.json();
}

// --- CRUD de conteúdo (Create / Read / Update / Delete) --------------------

// devolve { itens, total, pagina, por_pagina, total_paginas } — a paginação
// acontece no servidor agora. por_pagina tem um padrão alto (ver backend)
// pra quem só quer "tudo de uma vez" (Home, Leitor) não precisar mudar nada.
export function listarConteudos({ busca, editoria, status, pagina, porPagina, ordenar } = {}) {
  const params = new URLSearchParams();
  if (busca) params.set("busca", busca);
  if (editoria) params.set("editoria", editoria);
  if (status) params.set("status", status);
  if (pagina) params.set("pagina", pagina);
  if (porPagina) params.set("por_pagina", porPagina);
  if (ordenar) params.set("ordenar", ordenar);
  const query = params.toString();
  return requisicao(`/conteudos${query ? `?${query}` : ""}`);
}

export function obterConteudo(id) {
  return requisicao(`/conteudos/${id}`);
}

export function criarConteudo(dados) {
  return requisicao("/conteudos", {
    method: "POST",
    token: tokenAdmin(),
    body: JSON.stringify(dados),
  });
}

export function atualizarConteudo(id, dados) {
  return requisicao(`/conteudos/${id}`, {
    method: "PATCH",
    token: tokenAdmin(),
    body: JSON.stringify(dados),
  });
}

export function excluirConteudo(id) {
  return requisicao(`/conteudos/${id}`, { method: "DELETE", token: tokenAdmin() });
}

export function listarEditorias() {
  return requisicao("/editorias");
}

export function listarCartas({ status, busca } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (busca) params.set("busca", busca);
  const query = params.toString();
  return requisicao(`/cartas${query ? `?${query}` : ""}`);
}

export function atualizarCarta(id, dados) {
  return requisicao(`/cartas/${id}`, {
    method: "PATCH",
    token: tokenAdmin(),
    body: JSON.stringify(dados),
  });
}

export function cadastrar({ nome, email, senha, preferencias }) {
  return requisicao("/auth/cadastro", {
    method: "POST",
    body: JSON.stringify({ nome, email, senha, preferencias }),
  });
}

export function entrar({ email, senha }) {
  return requisicao("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
}

export function obterAssinanteAtual(token) {
  return requisicao("/auth/eu", { token });
}

export function atualizarPreferenciasAssinante(token, dados) {
  return requisicao("/auth/preferencias", {
    method: "PATCH",
    token,
    body: JSON.stringify(dados),
  });
}

export function apagarSinalAssinante(token, campo) {
  return requisicao(`/auth/preferencias/${campo}`, { method: "DELETE", token });
}

// --- Favoritos (conta do assinante — web e mobile usam as mesmas rotas) ---

export function listarMeusFavoritos(token) {
  return requisicao("/favoritos", { token });
}

export function favoritar(token, conteudoId) {
  return requisicao("/favoritos", {
    method: "POST",
    token,
    body: JSON.stringify({ conteudo_id: conteudoId }),
  });
}

export function desfavoritar(token, conteudoId) {
  return requisicao(`/favoritos/${conteudoId}`, { method: "DELETE", token });
}

// --- Comentários -------------------------------------------------------------

export function listarComentarios(conteudoId) {
  return requisicao(`/conteudos/${conteudoId}/comentarios`);
}

export function comentar(token, conteudoId, texto) {
  return requisicao(`/conteudos/${conteudoId}/comentarios`, {
    method: "POST",
    token,
    body: JSON.stringify({ texto }),
  });
}

export function apagarComentario(token, comentarioId) {
  return requisicao(`/comentarios/${comentarioId}`, { method: "DELETE", token });
}

// --- Estatísticas (painel da redação) -----------------------------------

export function obterEstatisticas() {
  return requisicao("/estatisticas", { token: tokenAdmin() });
}

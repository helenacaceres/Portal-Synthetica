const CHAVE_TOKEN = "synthetica.admin.token";

export function lerTokenAdmin() {
  try {
    return localStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null;
  }
}

export function salvarTokenAdmin(token) {
  try {
    localStorage.setItem(CHAVE_TOKEN, token);
  } catch {
    // segue sem persistir
  }
}

export function limparTokenAdmin() {
  try {
    localStorage.removeItem(CHAVE_TOKEN);
  } catch {
    // segue sem persistir
  }
}

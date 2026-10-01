const CHAVE_TOKEN = "synthetica.token";

export function lerToken() {
  try {
    return localStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null;
  }
}

export function salvarToken(token) {
  try {
    localStorage.setItem(CHAVE_TOKEN, token);
  } catch {
    // segue sem persistir
  }
}

export function limparToken() {
  try {
    localStorage.removeItem(CHAVE_TOKEN);
  } catch {
    // segue sem persistir
  }
}

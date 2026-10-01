import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { erro: null };

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    // Em produção isto iria para um serviço de monitoramento (Sentry etc.).
    console.error("Erro não tratado na UI:", erro, info?.componentStack);
  }

  render() {
    if (!this.state.erro) return this.props.children;

    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
          background: "var(--papel)",
          color: "var(--admin-texto)",
          fontFamily: '"Archivo", sans-serif',
        }}
      >
        <p
          className="mono"
          style={{ fontSize: 11, letterSpacing: "1.6px", color: "var(--admin-apoio)" }}
        >
          ALGO QUEBROU
        </p>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
          Esta tela encontrou um erro
        </h1>
        <p style={{ fontSize: 14, color: "var(--admin-apoio)", maxWidth: 420, margin: 0 }}>
          Recarregar costuma resolver. Se continuar, volte para a página inicial.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            className="mono"
            onClick={() => window.location.reload()}
            style={botao(true)}
          >
            RECARREGAR
          </button>
          <button
            className="mono"
            onClick={() => window.location.assign("/")}
            style={botao(false)}
          >
            IR PARA O INÍCIO
          </button>
        </div>
      </div>
    );
  }
}

function botao(primario) {
  return {
    fontSize: 11,
    letterSpacing: "1.4px",
    fontWeight: 700,
    padding: "14px 24px",
    borderRadius: 999,
    border: "1px solid rgba(11,11,14,0.15)",
    background: primario ? "var(--admin-texto)" : "white",
    color: primario ? "white" : "var(--admin-texto)",
  };
}

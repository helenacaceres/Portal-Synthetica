import { useNavigate } from "react-router-dom";

// Catch-all de rota. Antes, uma URL desconhecida renderizava tela branca.
export default function NaoEncontrado() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        padding: 24,
        textAlign: "center",
        background: "var(--papel)",
        color: "var(--admin-texto)",
        fontFamily: '"Archivo", sans-serif',
      }}
    >
      <p className="mono" style={{ fontSize: 11, letterSpacing: "1.6px", color: "var(--admin-apoio)" }}>
        ERRO 404
      </p>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Página não encontrada</h1>
      <p style={{ fontSize: 14, color: "var(--admin-apoio)", maxWidth: 380, margin: 0 }}>
        O endereço que você abriu não existe ou foi movido.
      </p>
      <button
        className="mono"
        onClick={() => navigate("/")}
        style={{
          marginTop: 6,
          fontSize: 11,
          letterSpacing: "1.4px",
          fontWeight: 700,
          padding: "14px 26px",
          borderRadius: 999,
          background: "var(--admin-texto)",
          color: "white",
        }}
      >
        VOLTAR AO INÍCIO
      </button>
    </div>
  );
}

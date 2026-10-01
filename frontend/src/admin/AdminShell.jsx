import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import glass from "../styles/glass.module.css";
import { obterAssinanteAtual } from "../api/client";
import { lerTokenAdmin, limparTokenAdmin } from "./sessaoAdmin";
import styles from "./AdminShell.module.css";

// Só telas que existem de verdade viram link. Edições e Assinantes ainda não
// têm rota — ficavam levando a uma tela em branco sem volta.
const LINKS = [
  { to: "/admin/painel", rotulo: "PAINEL" },
  { to: "/admin/conteudos", rotulo: "CONTEÚDOS" },
  { to: "/admin/cartas", rotulo: "CARTAS" },
];

const LINKS_FUTUROS = ["EDIÇÕES", "ASSINANTES"];

export default function AdminShell({ children }) {
  const navigate = useNavigate();
  const [editor, setEditor] = useState(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const token = lerTokenAdmin();
    if (!token) {
      navigate("/admin/login");
      return;
    }
    obterAssinanteAtual(token)
      .then((usuario) => {
        if (usuario.papel !== "editor") {
          limparTokenAdmin();
          navigate("/admin/login");
          return;
        }
        setEditor(usuario);
      })
      .catch(() => {
        limparTokenAdmin();
        navigate("/admin/login");
      })
      .finally(() => setVerificando(false));
  }, [navigate]);

  function sair() {
    limparTokenAdmin();
    navigate("/admin/login");
  }

  if (verificando || !editor) {
    return (
      <div className={glass.fundoAdmin}>
        <p
          className="mono"
          style={{
            padding: "48px 32px",
            fontSize: 12,
            letterSpacing: "1.4px",
            color: "var(--admin-apoio)",
          }}
        >
          Verificando acesso…
        </p>
      </div>
    );
  }

  return (
    <div className={glass.fundoAdmin}>
      <div className={styles.pagina}>
        <header className={`${glass.vidro} ${glass.pilula} ${styles.barra}`}>
          <div className={`${glass.vidroConteudo} ${styles.barraConteudo}`}>
            <p className="mono">SYNTHETICA · REDAÇÃO</p>
            <nav className={`mono ${styles.nav}`}>
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => (isActive ? styles.ativo : undefined)}
                >
                  {link.rotulo}
                </NavLink>
              ))}
              {LINKS_FUTUROS.map((rotulo) => (
                <span
                  key={rotulo}
                  className={styles.linkFuturo}
                  title="Em breve"
                  aria-disabled="true"
                >
                  {rotulo}
                </span>
              ))}
            </nav>
            <div className={styles.usuario}>
              <p className="mono">{editor.nome.toUpperCase()} · EDITORA-CHEFE</p>
              <button className={`mono ${styles.sair}`} onClick={sair}>
                SAIR
              </button>
            </div>
          </div>
        </header>

        <main className={styles.conteudo}>{children}</main>
      </div>
    </div>
  );
}

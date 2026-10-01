import { useState } from "react";
import { useNavigate } from "react-router-dom";
import glass from "../styles/glass.module.css";
import { entrar } from "../api/client";
import { salvarTokenAdmin } from "./sessaoAdmin";
import styles from "./AdminLogin.module.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const sessao = await entrar({ email, senha });
      if (sessao.assinante.papel !== "editor") {
        setErro("Essa conta não tem acesso à redação.");
        return;
      }
      salvarTokenAdmin(sessao.token);
      navigate("/admin/painel");
    } catch (e2) {
      setErro(e2.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={glass.fundoAdmin}>
      <div className={styles.pagina}>
        <p className={`mono ${styles.marca}`}>SYNTHETICA · REDAÇÃO</p>
        <div className={`${glass.vidro} ${styles.card}`}>
          <div className={glass.vidroConteudo}>
            <p className={`mono ${styles.rotulo}`}>ACESSO DA EQUIPE EDITORIAL</p>
            <h1 className={styles.titulo}>Entrar na redação</h1>
            <form onSubmit={enviar} className={styles.form}>
              <label className={styles.campo}>
                <span className="mono">E-MAIL</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="redacao@synthetica.app"
                />
              </label>
              <label className={styles.campo}>
                <span className="mono">SENHA</span>
                <input
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••••"
                />
              </label>
              {erro && <p className={styles.erro}>{erro}</p>}
              <button className={`mono ${styles.botao}`} disabled={enviando}>
                {enviando ? "ENTRANDO…" : "ENTRAR"}
              </button>
            </form>
            <p className={styles.nota}>
              Esta área é restrita à equipe editorial. Se você é assinante,{" "}
              <button className={styles.link} onClick={() => navigate("/login")}>
                entre por aqui
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

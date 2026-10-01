import { useState } from "react";
import { useNavigate } from "react-router-dom";
import glass from "../styles/glass.module.css";
import { cadastrar } from "../api/client";
import { lerPreferencias } from "./preferencias";
import { salvarToken } from "./sessao";
import styles from "./Cadastro.module.css";

export default function Cadastro() {
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
      const preferenciasLocais = lerPreferencias();
      const sessao = await cadastrar({
        email,
        senha,
        preferencias: {
          proporcao_avancos: preferenciasLocais.proporcaoAvancos,
          temas: preferenciasLocais.temas,
          perfil: preferenciasLocais.perfil,
          tempo: preferenciasLocais.tempo,
        },
      });
      salvarToken(sessao.token);
      navigate("/assinante");
    } catch (e2) {
      setErro(e2.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={styles.pagina}>
      <button className={`mono ${styles.marca}`} onClick={() => navigate("/")}>
        REVISTA SYNTHETICA
      </button>
      <div className={`${glass.vidro} ${styles.cupom}`}>
        <div className={glass.vidroConteudo}>
          <div className={styles.selo}>
            <p className="mono">EDIÇÃO #07 FECHADA</p>
          </div>
          <h1 className={styles.titulo}>Sua edição está pronta.</h1>
          <p className={styles.descricao}>
            Crie uma conta para guardá-la. Seus interesses já foram registrados na ficha, então
            não pedimos mais nada.
          </p>
          <div className={styles.linha} />
          <form onSubmit={enviar} className={styles.form}>
            <label className={styles.campo}>
              <span className="mono">E-MAIL</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@e-mail.com"
              />
            </label>
            <label className={styles.campo}>
              <span className="mono">SENHA</span>
              <input
                type="password"
                required
                minLength={8}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="mínimo 8 caracteres"
              />
            </label>
            {erro && <p className={styles.erro}>{erro}</p>}
            <button className={`mono ${styles.botao}`} disabled={enviando}>
              {enviando ? "GUARDANDO…" : "GUARDAR MINHA EDIÇÃO"}
            </button>
          </form>
          <p className={`mono ${styles.rodape}`}>
            Já tem conta?{" "}
            <button className={styles.linkEntrar} onClick={() => navigate("/login")}>
              Entrar
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

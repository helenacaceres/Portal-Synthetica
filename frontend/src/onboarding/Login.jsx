import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import glass from "../styles/glass.module.css";
import { entrar } from "../api/client";
import { salvarToken } from "./sessao";
import objetoCromado from "../assets/login/objeto-cromado.png";
import luzHalo from "../assets/login/luz-halo.svg";
import gota1 from "../assets/login/gota-1.svg";
import gota2 from "../assets/login/gota-2.svg";
import gota3 from "../assets/login/gota-3.svg";
import styles from "./Login.module.css";

// Quem chega no login vindo de outro passo do funil (ex.: Checkout achou que o
// e-mail já tinha conta) precisa voltar pra onde estava, não cair sempre na
// /home. Só aceitamos caminho interno pra não virar open-redirect.
function destinoSeguro(bruto) {
  if (bruto && bruto.startsWith("/") && !bruto.startsWith("//")) return bruto;
  return "/home";
}

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const destino = destinoSeguro(params.get("next"));
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
      salvarToken(sessao.token);
      navigate(destino);
    } catch (e2) {
      setErro(e2.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={styles.pagina}>
      <img src={luzHalo} alt="" className={styles.halo} />
      <img src={objetoCromado} alt="" className={styles.cromado} />
      <img src={gota1} alt="" className={styles.gota1} />
      <img src={gota2} alt="" className={styles.gota2} />
      <img src={gota3} alt="" className={styles.gota3} />

      <button className={`mono ${styles.marca}`} onClick={() => navigate("/")}>
        SYNTHETICA
      </button>
      <p className={`mono ${styles.acesso}`}>ACESSO DO ASSINANTE</p>
      <p className={`mono ${styles.edicao}`}>EDIÇÃO #07 · AGO 2047</p>

      <div className={`${glass.vidro} ${styles.card}`}>
        <div className={glass.vidroConteudo}>
          <p className={`mono ${styles.rotulo}`}>ENTRAR</p>
          <h1 className={styles.titulo}>
            Sua edição está
            <br />
            fechada e esperando
          </h1>

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
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••••"
              />
            </label>

            <div className={styles.opcoes}>
              <span>Manter conectado</span>
              <span className={styles.esqueci} title="Recuperação de senha em breve" aria-disabled="true">
                Esqueci minha senha
              </span>
            </div>

            {erro && <p className={styles.erro}>{erro}</p>}

            <button className={`mono ${styles.botaoEntrar}`} disabled={enviando}>
              {enviando ? "ENTRANDO…" : "ENTRAR"}
            </button>
            <button type="button" className={`mono ${styles.botaoGoogle}`} disabled>
              CONTINUAR COM GOOGLE
            </button>
          </form>

          <p className={styles.rodapeCard}>
            Ainda não assina?{" "}
            <button className={styles.linkAssinar} onClick={() => navigate("/")}>
              Ver planos
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

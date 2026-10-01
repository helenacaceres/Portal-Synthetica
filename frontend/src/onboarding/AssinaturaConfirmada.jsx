import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import glass from "../styles/glass.module.css";
import { obterAssinanteAtual } from "../api/client";
import { lerToken } from "./sessao";
import luzHalo from "../assets/confirmacao/luz-halo.svg";
import check from "../assets/confirmacao/check.png";
import styles from "./AssinaturaConfirmada.module.css";

export default function AssinaturaConfirmada() {
  const navigate = useNavigate();
  const hoje = new Date();
  const em7dias = new Date(hoje.getTime() + 7 * 86400000).toLocaleDateString("pt-BR");
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const token = lerToken();
    if (!token) return;
    obterAssinanteAtual(token)
      .then((a) => setEmail(a.email))
      .catch(() => {});
  }, []);

  return (
    <div className={styles.pagina}>
      <img src={luzHalo} alt="" className={styles.halo} />
      <button className={`mono ${styles.marca}`} onClick={() => navigate("/home")}>
        SYNTHETICA
      </button>

      <div className={`${glass.vidro} ${styles.card}`}>
        <div className={glass.vidroConteudo}>
          <img src={check} alt="" width={76} height={76} />
          <p className={`mono ${styles.selo}`}>ASSINATURA ATIVA</p>
          <h1 className={styles.titulo}>
            Pronto. Agora falta
            <br />
            montar a sua ficha
          </h1>
          <p className={styles.descricao}>
            Sem a ficha, o editor-chefe não sabe a proporção que você quer e fecha uma edição
            genérica. São quatro perguntas, leva dois minutos.
          </p>

          <div className={styles.resumo}>
            <Linha rotulo="Plano" valor="Anual · R$ 179,00" />
            <Linha rotulo="Teste grátis até" valor={em7dias} />
            <Linha rotulo="Primeira cobrança" valor={`R$ 179,00 em ${em7dias}`} />
            <Linha rotulo="Recibo enviado para" valor={email || "seu e-mail"} />
          </div>

          <button className={`mono ${styles.botaoPrimario}`} onClick={() => navigate("/assinatura")}>
            MONTAR MINHA FICHA
          </button>
          <button className={`mono ${styles.botaoSecundario}`} onClick={() => navigate("/home")}>
            FAZER ISSO DEPOIS
          </button>
          <p className={`mono ${styles.nota}`}>
            Você pode cancelar antes de {em7dias} e não paga nada.
          </p>
        </div>
      </div>
    </div>
  );
}

function Linha({ rotulo, valor }) {
  return (
    <div className={styles.linha}>
      <span>{rotulo}</span>
      <span>{valor}</span>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import glass from "../styles/glass.module.css";
import luzHalo from "../assets/cancelamento/luz-halo.svg";
import styles from "./CancelarAssinatura.module.css";

const MOTIVOS = ["PREÇO", "POUCO TEMPO", "CURADORIA", "OUTRO"];

export default function CancelarAssinatura() {
  const navigate = useNavigate();
  const [motivo, setMotivo] = useState(null);
  const [cancelado, setCancelado] = useState(false);

  if (cancelado) {
    return (
      <div className={styles.pagina}>
        <img src={luzHalo} alt="" className={styles.halo} />
        <div className={`${glass.vidro} ${styles.card}`}>
          <div className={glass.vidroConteudo}>
            <p className={`mono ${styles.selo}`}>ASSINATURA CANCELADA</p>
            <h1 className={styles.titulo}>Seu acesso continua até 08/09/2048.</h1>
            <p className={styles.descricao}>
              Sua ficha e histórico ficam guardados por 90 dias, caso mude de ideia.
            </p>
            <button className={`mono ${styles.botaoPrimario}`} onClick={() => navigate("/home")}>
              VOLTAR AO SYNTHETICA
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pagina}>
      <img src={luzHalo} alt="" className={styles.halo} />
      <button className={`mono ${styles.marca}`} onClick={() => navigate("/assinante")}>
        SYNTHETICA
      </button>

      <div className={`${glass.vidro} ${styles.card}`}>
        <div className={glass.vidroConteudo}>
          <p className={`mono ${styles.selo}`}>ASSINANTE #0412 · PLANO ANUAL</p>
          <h1 className={styles.titulo}>Antes de cancelar</h1>
          <p className={styles.descricao}>
            Sua assinatura vale até 08/09/2048. Se cancelar agora, você mantém o acesso até essa
            data e não é cobrado de novo.
          </p>

          <div className={styles.perdas}>
            <p className={`mono ${styles.perdasTitulo}`}>O QUE VOCÊ PERDE EM 08/09/2048</p>
            <p>— As doze edições fechadas para o seu perfil por ano</p>
            <p>— O acervo completo de 214 matérias</p>
            <p>— A sua ficha e os sinais de leitura que ela guarda</p>
          </div>

          <div className={styles.alternativas}>
            <button className={`mono ${styles.alternativa}`} disabled>
              PAUSAR POR 3 MESES
            </button>
            <button className={`mono ${styles.alternativa}`} disabled>
              TROCAR PARA O MENSAL
            </button>
          </div>

          <p className={`mono ${styles.perguntaMotivo}`}>POR QUE ESTÁ SAINDO? (OPCIONAL)</p>
          <div className={styles.motivos}>
            {MOTIVOS.map((m) => (
              <button
                key={m}
                className={`mono ${styles.motivo} ${motivo === m ? styles.motivoAtivo : ""}`}
                onClick={() => setMotivo(m)}
              >
                {m}
              </button>
            ))}
          </div>

          <div className={styles.acoes}>
            <button className={`mono ${styles.manter}`} onClick={() => navigate("/assinante")}>
              MANTER MINHA ASSINATURA
            </button>
            <button className={`mono ${styles.cancelar}`} onClick={() => setCancelado(true)}>
              CANCELAR MESMO ASSIM
            </button>
          </div>
          <p className={`mono ${styles.nota}`}>
            Sua ficha e o histórico ficam guardados por 90 dias. Depois disso são apagados.
          </p>
        </div>
      </div>
    </div>
  );
}

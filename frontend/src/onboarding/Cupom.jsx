import { Link } from "react-router-dom";
import glass from "../styles/glass.module.css";
import styles from "./Cupom.module.css";

export default function Cupom({
  passo,
  totalPassos = 4,
  titulo,
  descricao,
  children,
  rotuloVoltar = "VOLTAR",
  rotuloContinuar = "CONTINUAR",
  onVoltar,
  onContinuar,
  continuarDesabilitado,
}) {
  return (
    <div className={styles.pagina}>
      <Link to="/" className={`mono ${styles.marca}`}>
        REVISTA SYNTHETICA
      </Link>
      <div className={`${glass.vidro} ${styles.cupom}`}>
        <div className={glass.vidroConteudo}>
          <div className={styles.cabecalho}>
            <p className="mono">FICHA DE ASSINATURA</p>
            <p className={`mono ${styles.contador}`}>
              {String(passo).padStart(2, "0")} / {String(totalPassos).padStart(2, "0")}
            </p>
          </div>
          <div className={styles.linha} />
          <h1 className={styles.titulo}>{titulo}</h1>
          <p className={styles.descricao}>{descricao}</p>
          <div className={styles.controle}>{children}</div>
          <div className={styles.linha} />
          <div className={styles.rodape}>
            <button className={`mono ${styles.voltar}`} onClick={onVoltar}>
              {rotuloVoltar}
            </button>
            <button
              className={`mono ${styles.continuar}`}
              onClick={onContinuar}
              disabled={continuarDesabilitado}
            >
              {rotuloContinuar}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

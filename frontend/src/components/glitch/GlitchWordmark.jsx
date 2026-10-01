import { useGlitchGatilho } from "./useGlitchGatilho";
import styles from "./GlitchWordmark.module.css";

export default function GlitchWordmark({ texto, className = "", intervaloMinMs = 10000, intervaloMaxMs = 24000 }) {
  const { ativo, disparar } = useGlitchGatilho({
    duracaoMs: 340,
    intervaloMinMs,
    intervaloMaxMs,
  });

  return (
    <div className={`${styles.raiz} ${className} ${ativo ? styles.ativo : ""}`} onMouseEnter={disparar} aria-hidden="true">
      <p className={`${styles.camada} ${styles.magenta}`}>{texto}</p>
      <p className={`${styles.camada} ${styles.ciano}`}>{texto}</p>
      <p className={`${styles.camada} ${styles.base}`} data-lens-scene>
        {texto}
      </p>
      <span className={styles.linha1} />
      <span className={styles.linha2} />
    </div>
  );
}

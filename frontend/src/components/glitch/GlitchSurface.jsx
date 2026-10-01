import { useGlitchGatilho } from "./useGlitchGatilho";
import styles from "./GlitchSurface.module.css";

export default function GlitchSurface({ children, className = "", intervaloMinMs = 9000, intervaloMaxMs = 21000 }) {
  const { ativo } = useGlitchGatilho({ duracaoMs: 260, intervaloMinMs, intervaloMaxMs });

  return (
    <div className={`${styles.raiz} ${className} ${ativo ? styles.ativo : ""}`}>
      <div className={styles.conteudo}>{children}</div>
      <span aria-hidden="true" className={styles.varredura} />
    </div>
  );
}

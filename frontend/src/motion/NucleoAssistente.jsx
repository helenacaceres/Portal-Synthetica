import styles from "./NucleoAssistente.module.css";

// CP1 de Motion, opção 1. estado: "idle" | "processando" | "respondendo"
export default function NucleoAssistente({ estado = "idle", tamanho = 120 }) {
  return (
    <div
      className={`${styles.nucleo} ${styles[estado] || styles.idle}`}
      style={{ width: tamanho, height: tamanho }}
      role="img"
      aria-label={`Assistente de IA: ${estado}`}
    >
      <span className={styles.halo} aria-hidden="true" />
      <span className={styles.pulso} aria-hidden="true" />
      <span className={styles.anel} aria-hidden="true" />
      <span className={styles.anelInterno} aria-hidden="true" />
      <span className={styles.miolo} aria-hidden="true" />
    </div>
  );
}

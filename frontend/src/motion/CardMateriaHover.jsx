import styles from "./CardMateriaHover.module.css";

// CP1 de Motion, opção 3 (hover no card)
export default function CardMateriaHover({
  editoria = "IA NA ARTE E CULTURA",
  titulo = "Réplicas e replicantes",
  chamada = "Como o cinema imaginou a consciência artificial antes dos laboratórios.",
  trecho = "De Metropolis a Blade Runner, a ficção fixou imagens que a pesquisa levou décadas para alcançar — e algumas que ela nunca alcançou.",
  autor = "TOMÁS BELTRÃO",
  minutos = 12,
}) {
  return (
    <article className={styles.card} tabIndex={0}>
      <div className={styles.mediaArea}>
        <div className={styles.media} />
        <span className={`mono ${styles.badge}`}>
          <span className={styles.badgeRotulo}>LEITURA&nbsp;·&nbsp;</span>
          {minutos} MIN
        </span>
      </div>

      <div className={styles.corpo}>
        <p className={`mono ${styles.editoria}`}>{editoria}</p>
        <h3 className={styles.titulo}>{titulo}</h3>
        <p className={styles.chamada}>{chamada}</p>

        <div className={styles.trechoWrap}>
          <p className={styles.trecho}>{trecho}</p>
        </div>

        <p className={`mono ${styles.autor}`}>{autor}</p>
      </div>
    </article>
  );
}

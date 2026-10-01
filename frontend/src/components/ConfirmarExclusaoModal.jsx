import { useEffect, useRef } from "react";
import glass from "../styles/glass.module.css";
import styles from "./ConfirmarExclusaoModal.module.css";

export default function ConfirmarExclusaoModal({ conteudo, onCancelar, onConfirmar }) {
  const dialogoRef = useRef(null);
  const cancelarRef = useRef(null);
  const focoAnteriorRef = useRef(null);
  const onCancelarRef = useRef(onCancelar);
  useEffect(() => {
    onCancelarRef.current = onCancelar;
  });

  useEffect(() => {
    if (!conteudo) return undefined;

    focoAnteriorRef.current = document.activeElement;
    cancelarRef.current?.focus();

    // Fecha no Esc e mantém o Tab preso dentro do diálogo (focus trap).
    function aoTeclar(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancelarRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const foco = dialogoRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!foco || foco.length === 0) return;
      const primeiro = foco[0];
      const ultimo = foco[foco.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener("keydown", aoTeclar);
    const rolagemAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = rolagemAnterior;
      focoAnteriorRef.current?.focus?.();
    };
  }, [conteudo]);

  if (!conteudo) return null;

  return (
    <div
      className={styles.fundo}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancelar();
      }}
    >
      <div
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-exclusao-titulo"
        aria-describedby="modal-exclusao-descricao"
        className={`${glass.vidro} ${styles.dialogo}`}
      >
        <div className={glass.vidroConteudo}>
          <p className={`mono ${styles.rotulo}`}>EXCLUSÃO PERMANENTE</p>
          <h2 id="modal-exclusao-titulo" className={styles.pergunta}>
            Excluir &ldquo;{conteudo.titulo}&rdquo;?
          </h2>
          <p id="modal-exclusao-descricao" className={styles.descricao}>
            O conteúdo #{String(conteudo.id).padStart(4, "0")} sai do acervo.{" "}
            {conteudo.total_comentarios} comentário(s) e {conteudo.total_favoritos} favorito(s)
            ligados a ele são removidos junto.
          </p>
          <div className={`mono ${styles.dica}`}>
            Para tirar do ar sem perder o histórico, mude o status para RASCUNHO.
          </div>
          <div className={styles.acoes}>
            <button ref={cancelarRef} className={`mono ${styles.cancelar}`} onClick={onCancelar}>
              CANCELAR
            </button>
            <button className={`mono ${styles.excluir}`} onClick={() => onConfirmar(conteudo.id)}>
              EXCLUIR MESMO ASSIM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

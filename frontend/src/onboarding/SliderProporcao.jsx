import { useCallback, useRef } from "react";
import styles from "./SliderProporcao.module.css";

const MIN = 4;
const MAX = 96;

function limitar(v) {
  return Math.min(MAX, Math.max(MIN, Math.round(v)));
}

export default function SliderProporcao({ valor, onChange }) {
  const trilhoRef = useRef(null);
  const arrastandoRef = useRef(false);

  const valorPorPosicao = useCallback((clientX) => {
    const trilho = trilhoRef.current;
    if (!trilho) return null;
    const { left, width } = trilho.getBoundingClientRect();
    return limitar(((clientX - left) / width) * 100);
  }, []);

  function aoPressionar(e) {
    arrastandoRef.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const novo = valorPorPosicao(e.clientX);
    if (novo !== null) onChange(novo);
  }

  function aoMover(e) {
    if (!arrastandoRef.current) return;
    const novo = valorPorPosicao(e.clientX);
    if (novo !== null) onChange(novo);
  }

  function aoSoltar() {
    arrastandoRef.current = false;
  }

  function aoTeclar(e) {
    const passo = e.shiftKey ? 10 : 1;
    let novo = valor;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") novo = valor - passo;
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") novo = valor + passo;
    else if (e.key === "PageDown") novo = valor - 10;
    else if (e.key === "PageUp") novo = valor + 10;
    else if (e.key === "Home") novo = MIN;
    else if (e.key === "End") novo = MAX;
    else return;
    e.preventDefault();
    onChange(limitar(novo));
  }

  return (
    <div className={styles.controle}>
      <div className={`mono ${styles.rotulos}`}>
        <span>AVANÇOS TECNOLÓGICOS</span>
        <span>IA NA ARTE E CULTURA</span>
      </div>
      <div
        ref={trilhoRef}
        className={styles.trilho}
        role="slider"
        tabIndex={0}
        aria-label="Proporção entre avanços tecnológicos e cultura"
        aria-valuemin={MIN}
        aria-valuemax={MAX}
        aria-valuenow={valor}
        aria-valuetext={`${valor}% avanços tecnológicos, ${100 - valor}% cultura`}
        onPointerDown={aoPressionar}
        onPointerMove={aoMover}
        onPointerUp={aoSoltar}
        onPointerCancel={aoSoltar}
        onKeyDown={aoTeclar}
      >
        <div className={styles.segmentoEsquerda} style={{ width: `${valor}%` }} />
        <div className={styles.segmentoDireita} style={{ width: `${100 - valor}%` }} />
        <div className={`mono ${styles.divisoria}`} style={{ left: `${valor}%` }} aria-hidden="true">
          ||
        </div>
      </div>
      <div className={styles.legenda}>
        <p className={styles.numeroAtivo}>{valor}%</p>
        <p className={styles.numeroInativo}>{100 - valor}%</p>
      </div>
      <p className={styles.nota}>
        Sua capa vai abrir na face {valor >= 50 ? "de avanços tecnológicos" : "institucional"}.
      </p>
    </div>
  );
}

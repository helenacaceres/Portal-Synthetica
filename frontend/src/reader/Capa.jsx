import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarConteudos } from "../api/client";
import styles from "./Capa.module.css";

const REDUZIDO =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function Capa() {
  const navigate = useNavigate();
  const [materias, setMaterias] = useState([]);
  const [arrasteX, setArrasteX] = useState(0);
  const [arrastando, setArrastando] = useState(false);
  const [abrindo, setAbrindo] = useState(false);
  const inicioX = useRef(0);
  const largura = useRef(1);
  const jaAbriu = useRef(false);

  useEffect(() => {
    listarConteudos({ status: "publicado" })
      .then(({ itens }) =>
        setMaterias([...itens].sort((a, b) => (a.pagina ?? 999) - (b.pagina ?? 999)))
      )
      .catch(() => setMaterias([]));
  }, []);

  const capa = materias[0];

  function abrir() {
    if (abrindo) return;
    if (REDUZIDO) {
      navigate("/home");
      return;
    }
    setAbrindo(true);
  }

  function aoPressionar(e) {
    if (REDUZIDO || abrindo || e.target.closest("button")) return;
    largura.current = e.currentTarget.getBoundingClientRect().width || 1;
    inicioX.current = e.clientX;
    setArrastando(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function aoMover(e) {
    if (!arrastando) return;
    const dx = Math.min(0, e.clientX - inicioX.current); // só abre pra esquerda
    setArrasteX(dx * 0.85);
  }

  function aoSoltar() {
    if (!arrastando) return;
    setArrastando(false);
    if (Math.abs(arrasteX) > largura.current * 0.3) abrir();
    else setArrasteX(0);
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.verso} aria-hidden="true">
        <p className="mono">EDIÇÃO #07</p>
        <p className={styles.versoNota}>abrindo…</p>
      </div>

      <div
        className={`${styles.folha} ${!arrastando ? styles.folhaSolta : ""} ${
          abrindo ? styles.folhaAbrindo : ""
        }`}
        style={
          abrindo
            ? undefined
            : { transform: `translateX(${arrasteX}px) rotateZ(${arrasteX * 0.006}deg)` }
        }
        onPointerDown={aoPressionar}
        onPointerMove={aoMover}
        onPointerUp={aoSoltar}
        onPointerCancel={aoSoltar}
        onTransitionEnd={() => {
          if (abrindo && !jaAbriu.current) {
            jaAbriu.current = true;
            navigate("/home");
          }
        }}
      >
        <div className={styles.folhaConteudo}>
          <header className={styles.cabecalho}>
            <span className={`mono ${styles.selo}`}>REVISTA DE INTELIGÊNCIA ARTIFICIAL</span>
            <span className={`mono ${styles.edicao}`}>EDIÇÃO #07 · AGO 2047</span>
          </header>

          <div className={styles.centro}>
            <h1 className={styles.wordmark}>SYNTHETICA</h1>
            <p className={`mono ${styles.subtitulo}`}>
              Edição fechada para você · distribuição personalizada
            </p>

            {capa && (
              <button
                className={styles.manchete}
                onClick={() => navigate(`/leitura/${capa.id}`)}
              >
                <span className={`mono ${styles.mancheteRotulo}`}>
                  MATÉRIA DE CAPA · {capa.editoria.nome.toUpperCase()}
                </span>
                <span className={styles.mancheteTitulo}>{capa.titulo}</span>
              </button>
            )}
          </div>

          <footer className={styles.rodape}>
            <button className={`mono ${styles.abrir}`} onClick={abrir}>
              ABRIR EDIÇÃO →
            </button>
            <span className={`mono ${styles.dica}`}>
              {REDUZIDO ? "toque para entrar" : "ou arraste a folha para o lado"}
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from "react";
import { useGlitchGatilho } from "./useGlitchGatilho";
import styles from "./GlitchText.module.css";

export default function GlitchText({
  children,
  as: Tag = "span",
  className = "",
  intensidade = 1,
  aoPassarMouse = false,
  aoEntrarNaTela = false,
  automatico = true,
  intervaloMinMs = 7000,
  intervaloMaxMs = 18000,
  duracaoMs = 320,
}) {
  const raizRef = useRef(null);
  const { ativo, disparar } = useGlitchGatilho({
    duracaoMs,
    intervaloMinMs,
    intervaloMaxMs,
    automatico,
  });

  useEffect(() => {
    if (!aoEntrarNaTela) return undefined;
    const el = raizRef.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      (entradas) => {
        if (entradas[0]?.isIntersecting) {
          setTimeout(disparar, 200 + Math.random() * 500);
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aoEntrarNaTela]);

  return (
    <Tag
      ref={raizRef}
      className={`${styles.raiz} ${className} ${ativo ? styles.ativo : ""}`}
      style={{ "--glitch-intensidade": intensidade }}
      onMouseEnter={aoPassarMouse ? disparar : undefined}
    >
      <span className={styles.camadaBase}>{children}</span>
      <span aria-hidden="true" className={styles.camadaFantasma}>
        {children}
      </span>
      <span aria-hidden="true" className={styles.varredura} />
    </Tag>
  );
}

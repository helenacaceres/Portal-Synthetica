import { useEffect, useRef, useState } from "react";

export function useGlitchGatilho({
  duracaoMs = 320,
  intervaloMinMs = 7000,
  intervaloMaxMs = 18000,
  automatico = true,
} = {}) {
  const [ativo, setAtivo] = useState(false);
  const reduzMovimentoRef = useRef(false);
  const timeoutAgendaRef = useRef(null);
  const timeoutFimRef = useRef(null);

  useEffect(() => {
    reduzMovimentoRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  function disparar() {
    if (reduzMovimentoRef.current) return;
    setAtivo(true);
    clearTimeout(timeoutFimRef.current);
    timeoutFimRef.current = setTimeout(() => setAtivo(false), duracaoMs);
  }

  useEffect(() => {
    if (!automatico) return undefined;

    function agendarProximo() {
      const espera = intervaloMinMs + Math.random() * (intervaloMaxMs - intervaloMinMs);
      timeoutAgendaRef.current = setTimeout(() => {
        disparar();
        agendarProximo();
      }, espera);
    }

    if (!reduzMovimentoRef.current) agendarProximo();

    return () => clearTimeout(timeoutAgendaRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [automatico, intervaloMinMs, intervaloMaxMs, duracaoMs]);

  useEffect(() => () => clearTimeout(timeoutFimRef.current), []);

  return { ativo, disparar };
}

import { useEffect, useRef, useState } from "react";
import NucleoAssistente from "./NucleoAssistente";
import PainelEixos from "./PainelEixos";
import CardMateriaHover from "./CardMateriaHover";
import styles from "./MotionCP.module.css";

const ESTADOS = ["idle", "processando", "respondendo"];

// junta as três microinterações do CP1 num lugar só, com botão pra disparar
// cada uma — facilita mostrar pro professor sem precisar caçar onde cada
// uma aparece no site de verdade.
export default function MotionCP() {
  const [estado, setEstado] = useState("idle");
  const [auto, setAuto] = useState(false);
  const timers = useRef([]);

  function limparTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  // "Simular pergunta": idle -> processando -> respondendo -> idle,
  // com os tempos que uma resposta real teria.
  function simular() {
    limparTimers();
    setAuto(true);
    setEstado("processando");
    timers.current.push(setTimeout(() => setEstado("respondendo"), 1600));
    timers.current.push(
      setTimeout(() => {
        setEstado("idle");
        setAuto(false);
      }, 2750)
    );
  }

  useEffect(() => limparTimers, []);

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <p className={`mono ${styles.kicker}`}>DESIGN ESSENTIAL &amp; MOTION GRAPHICS · CP1</p>
        <h1 className={styles.h1}>Microinterações &amp; UI Motion</h1>
        <p className={styles.intro}>
          Três microinterações do Portal Synthetica, cada uma aplicando os
          princípios de UX Motion: <strong>ritmo</strong> (cada gesto tem
          cadência própria), <strong>easing</strong> (curvas com peso, nunca
          linear onde deveria ter vida) e <strong>clareza de feedback</strong>{" "}
          (o movimento diz o que aconteceu). Todas respeitam{" "}
          <code>prefers-reduced-motion</code>.
        </p>
      </header>

      {/* ---------- OPÇÃO 1 ---------- */}
      <section className={styles.secao}>
        <div className={styles.secaoTitulo}>
          <span className={`mono ${styles.num}`}>01</span>
          <div>
            <h2 className={styles.h2}>Núcleo do assistente de IA</h2>
            <p className={styles.desc}>
              Idle respira devagar; processando pulsa curto com o anel girando
              (linear = "trabalhando"); respondendo contrai, expande com
              overshoot e emite um pulso — um gesto só.
            </p>
          </div>
        </div>

        <div className={styles.palcoNucleo}>
          <NucleoAssistente estado={estado} tamanho={150} />
        </div>

        <div className={styles.controles}>
          {ESTADOS.map((e) => (
            <button
              key={e}
              className={`mono ${styles.btn} ${estado === e && !auto ? styles.btnAtivo : ""}`}
              disabled={auto}
              onClick={() => {
                limparTimers();
                setAuto(false);
                setEstado(e);
              }}
            >
              {e}
            </button>
          ))}
          <button className={`mono ${styles.btnPrimario}`} onClick={simular} disabled={auto}>
            {auto ? "simulando…" : "▶ simular pergunta"}
          </button>
        </div>
      </section>

      {/* ---------- OPÇÃO 2 ---------- */}
      <section className={styles.secao}>
        <div className={styles.secaoTitulo}>
          <span className={`mono ${styles.num}`}>02</span>
          <div>
            <h2 className={styles.h2}>Troca de aba entre eixos</h2>
            <p className={styles.desc}>
              O indicador desliza (expo-out); o conteúdo novo entra em cascata
              na ordem de leitura; a aba ativa é inequívoca e o clique confirma
              com um micro-press.
            </p>
          </div>
        </div>
        <div className={styles.palco}>
          <PainelEixos />
        </div>
      </section>

      {/* ---------- OPÇÃO 3 ---------- */}
      <section className={styles.secao}>
        <div className={styles.secaoTitulo}>
          <span className={`mono ${styles.num}`}>03</span>
          <div>
            <h2 className={styles.h2}>Card de matéria no hover</h2>
            <p className={styles.desc}>
              Passe o cursor (ou dê Tab): o card sobe com overshoot leve, a
              mídia dá zoom ~120ms depois, o trecho extra se revela e o badge
              cresce de "12 MIN" para "LEITURA · 12 MIN".
            </p>
          </div>
        </div>
        <div className={`${styles.palco} ${styles.palcoCards}`}>
          <CardMateriaHover />
          <CardMateriaHover
            editoria="AVANÇOS TECNOLÓGICOS"
            titulo="Chips que pensam como sinapses"
            chamada="A geração neuromórfica chega ao mercado consumidor prometendo eficiência inédita."
            trecho="Menos ciclos de clock, mais eventos: o processador só gasta energia quando um 'neurônio' dispara. Na prática, autonomia de dias onde antes eram horas."
            autor="MARINA CHEN"
            minutos={7}
          />
        </div>
      </section>

      <footer className={styles.rodape}>
        <p className="mono">
          easing: expo-out <code>cubic-bezier(.22,1,.36,1)</code> · back-out{" "}
          <code>cubic-bezier(.34,1.56,.64,1)</code> · linear só no anel de
          processamento
        </p>
      </footer>
    </div>
  );
}

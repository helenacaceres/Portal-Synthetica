import { useState } from "react";
import styles from "./PainelEixos.module.css";

// CP1 de Motion, opção 2 (troca de aba)

const EIXOS = [
  {
    id: "avancos",
    aba: "Avanços Tecnológicos",
    eyebrow: "EIXO EDITORIAL 01",
    titulo: "A máquina que aprendeu a ver",
    texto:
      "Reconhecimento facial, chips neuromórficos, simulação climática mais barata. O que sai do laboratório e chega na rua — e a que custo.",
    tags: ["hardware", "visão computacional", "regulação"],
  },
  {
    id: "arte",
    aba: "IA na Arte e Cultura",
    eyebrow: "EIXO EDITORIAL 02",
    titulo: "Quem assina o algoritmo",
    texto:
      "Curadoria por IA em museu, coletivos que creditam modelos como coautores, o debate de autoria que se intensifica a cada exposição.",
    tags: ["autoria", "curadoria", "cultura visual"],
  },
];

export default function PainelEixos() {
  const [ativo, setAtivo] = useState(0);
  const [pressionado, setPressionado] = useState(false);
  const eixo = EIXOS[ativo];

  return (
    <div className={styles.painel}>
      <div className={styles.abas} role="tablist" aria-label="Eixos editoriais">
        <span
          className={styles.indicador}
          style={{ transform: `translateX(${ativo * 100}%)` }}
          aria-hidden="true"
        />
        {EIXOS.map((e, i) => (
          <button
            key={e.id}
            role="tab"
            aria-selected={i === ativo}
            className={`mono ${styles.aba} ${i === ativo ? styles.abaAtiva : ""} ${
              pressionado && i === ativo ? styles.abaPress : ""
            }`}
            onPointerDown={() => setPressionado(true)}
            onPointerUp={() => setPressionado(false)}
            onPointerLeave={() => setPressionado(false)}
            onClick={() => setAtivo(i)}
          >
            {e.aba}
          </button>
        ))}
      </div>

      {/* key força o React a remontar o conteúdo -> a animação de entrada
          (com o stagger) reproduz a cada troca de aba */}
      <div key={eixo.id} className={styles.conteudo}>
        <p className={`mono ${styles.eyebrow}`}>{eixo.eyebrow}</p>
        <h3 className={styles.titulo}>{eixo.titulo}</h3>
        <p className={styles.texto}>{eixo.texto}</p>
        <ul className={styles.tags}>
          {eixo.tags.map((t) => (
            <li key={t} className="mono">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

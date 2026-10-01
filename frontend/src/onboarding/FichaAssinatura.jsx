import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cupom from "./Cupom";
import SliderProporcao from "./SliderProporcao";
import { OPCOES_TEMPO, TEMAS_DISPONIVEIS, lerPreferencias, salvarPreferencias } from "./preferencias";
import styles from "./FichaAssinatura.module.css";

export default function FichaAssinatura() {
  const navigate = useNavigate();
  const [passo, setPasso] = useState(1);
  const [respostas, setRespostas] = useState(lerPreferencias);

  function atualizar(campo, valor) {
    setRespostas((atual) => ({ ...atual, [campo]: valor }));
  }

  function alternarTema(tema) {
    setRespostas((atual) => ({
      ...atual,
      temas: atual.temas.includes(tema)
        ? atual.temas.filter((t) => t !== tema)
        : [...atual.temas, tema],
    }));
  }

  function irParaProximo() {
    if (passo < 4) {
      setPasso(passo + 1);
      return;
    }
    salvarPreferencias(respostas);
    setPasso(5);
  }

  function voltar() {
    if (passo === 1) {
      navigate("/");
      return;
    }
    setPasso(passo - 1);
  }

  const opcaoTempoAtual = OPCOES_TEMPO.find((o) => o.valor === respostas.tempo) ?? OPCOES_TEMPO[1];

  if (passo === 5) {
    return <TelaFechamento opcaoTempo={opcaoTempoAtual} />;
  }

  if (passo === 1) {
    return (
      <Cupom
        passo={1}
        titulo="Quanto de cada mundo você quer ler?"
        descricao="Arraste a divisória. Ela define a proporção do seu sumário e qual face abre a sua capa."
        rotuloVoltar="PULAR ESTA ETAPA"
        onVoltar={() => setPasso(2)}
        onContinuar={irParaProximo}
      >
        <SliderProporcao
          valor={respostas.proporcaoAvancos}
          onChange={(v) => atualizar("proporcaoAvancos", v)}
        />
      </Cupom>
    );
  }

  if (passo === 2) {
    return (
      <Cupom
        passo={2}
        titulo="Sobre o que você quer que a gente fale?"
        descricao="Marque quantos quiser. Os temas cruzam as duas editorias."
        onVoltar={voltar}
        onContinuar={irParaProximo}
      >
        <div className={styles.grade}>
          {TEMAS_DISPONIVEIS.map((tema) => (
            <button
              key={tema}
              className={`mono ${styles.tema} ${
                respostas.temas.includes(tema) ? styles.temaAtivo : ""
              }`}
              onClick={() => alternarTema(tema)}
            >
              {tema}
            </button>
          ))}
        </div>
      </Cupom>
    );
  }

  if (passo === 3) {
    return (
      <Cupom
        passo={3}
        titulo="De onde a gente parte?"
        descricao="Isso muda o registro das chamadas, não a profundidade das matérias."
        onVoltar={voltar}
        onContinuar={irParaProximo}
      >
        <div className={styles.opcoesPerfil}>
          <button
            className={`${styles.opcaoPerfil} ${
              respostas.perfil === "comecando" ? styles.opcaoPerfilAtiva : ""
            }`}
            onClick={() => atualizar("perfil", "comecando")}
          >
            <p className="mono">ESTOU COMEÇANDO</p>
            <p>As chamadas explicam os termos antes de usá-los.</p>
          </button>
          <button
            className={`${styles.opcaoPerfil} ${
              respostas.perfil === "acompanho" ? styles.opcaoPerfilAtiva : ""
            }`}
            onClick={() => atualizar("perfil", "acompanho")}
          >
            <p className="mono">JÁ ACOMPANHO</p>
            <p>As chamadas vão direto ao ponto e citam as fontes.</p>
          </button>
        </div>
      </Cupom>
    );
  }

  return (
    <Cupom
      passo={4}
      titulo="Quanto tempo você tem?"
      descricao="A sua edição fecha com um número de páginas. Toda revista tem última página."
      rotuloContinuar="FECHAR MINHA EDIÇÃO"
      onVoltar={voltar}
      onContinuar={irParaProximo}
    >
      <div className={styles.opcoesTempo}>
        {OPCOES_TEMPO.map((opcao) => (
          <button
            key={opcao.valor}
            className={`${styles.opcaoTempo} ${
              respostas.tempo === opcao.valor ? styles.opcaoTempoAtiva : ""
            }`}
            onClick={() => atualizar("tempo", opcao.valor)}
          >
            <p className={styles.opcaoTempoTitulo}>{opcao.rotulo}</p>
            <p className={`mono ${styles.opcaoTempoSub}`}>{opcao.materias} matérias</p>
          </button>
        ))}
      </div>
      <p className={styles.notaTempo}>
        Sua edição de agosto vai fechar com {opcaoTempoAtual.materias} matérias, distribuídas em{" "}
        {respostas.proporcaoAvancos}% de avanços e {100 - respostas.proporcaoAvancos}% de cultura.
      </p>
    </Cupom>
  );
}

function TelaFechamento({ opcaoTempo }) {
  const navigate = useNavigate();

  const materias = [
    { pagina: "03", titulo: "A máquina que aprendeu a ver" },
    { pagina: "11", titulo: "O futuro já foi imaginado antes" },
    { pagina: "18", titulo: "Quem assina o algoritmo" },
  ].slice(0, opcaoTempo.materias);

  const placeholders = Math.max(0, opcaoTempo.materias - materias.length);

  return (
    <div className={styles.paginaFechamento}>
      <div className={`mono ${styles.selo}`}>EDITOR-CHEFE IA</div>
      <h1 className={styles.tituloFechamento}>Fechando a sua edição.</h1>
      <div className={styles.sumario}>
        {materias.map((m) => (
          <div key={m.pagina} className={styles.linhaSumario}>
            <p className="mono">P. {m.pagina}</p>
            <p className={styles.linhaSumarioTitulo}>{m.titulo}</p>
          </div>
        ))}
        {Array.from({ length: placeholders }).map((_, i) => (
          <div key={`placeholder-${i}`} className={styles.linhaSumario}>
            <p className={`mono ${styles.paginaFraca}`}>P. {24 + i * 7}</p>
            <div className={styles.linhaFantasma} />
          </div>
        ))}
      </div>
      <p className={styles.notaFinal}>
        Cruzando o seu histórico com 214 matérias do acervo. Nenhum texto é inventado: a edição é
        montada a partir do que já está publicado.
      </p>
      <button className={`mono ${styles.botaoContinuar}`} onClick={() => navigate("/cadastro")}>
        CRIAR MINHA CONTA →
      </button>
    </div>
  );
}

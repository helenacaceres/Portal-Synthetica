import { useEffect, useMemo, useState } from "react";
import { atualizarCarta, listarCartas } from "../../api/client";
import glass from "../../styles/glass.module.css";
import styles from "./Cartas.module.css";

const FILTROS = [
  { valor: "pendente", rotulo: "PENDENTES" },
  { valor: "aprovada", rotulo: "APROVADAS" },
  { valor: "recusada", rotulo: "RECUSADAS" },
  { valor: null, rotulo: "TODAS" },
];

function tempoRelativo(iso) {
  const dias = Math.max(0, Math.floor((Date.now() - new Date(iso)) / 86400000));
  if (dias === 0) return "hoje";
  if (dias === 1) return "há 1 dia";
  return `há ${dias} dias`;
}

export default function Cartas() {
  const [cartas, setCartas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("pendente");
  const [selecionadas, setSelecionadas] = useState(new Set());
  const [contagens, setContagens] = useState({ pendente: 0, aprovada: 0, recusada: 0 });
  const [aviso, setAviso] = useState(null);
  const [processando, setProcessando] = useState(false);

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      const [filtradas, todas] = await Promise.all([
        listarCartas({ status: filtroAtivo || undefined, busca: busca || undefined }),
        listarCartas(),
      ]);
      setCartas(filtradas);
      setSelecionadas(new Set());
      setContagens({
        pendente: todas.filter((c) => c.status === "pendente").length,
        aprovada: todas.filter((c) => c.status === "aprovada").length,
        recusada: todas.filter((c) => c.status === "recusada").length,
      });
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    const debounce = setTimeout(carregar, 250);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, filtroAtivo]);

  function alternarSelecao(id) {
    setSelecionadas((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  async function definirStatus(ids, status) {
    if (ids.length === 0 || processando) return;
    setErro(null);
    setAviso(null);
    setProcessando(true);
    const verbo = status === "aprovada" ? "aprovada(s)" : "recusada(s)";

    const resultados = await Promise.allSettled(
      ids.map((id) => atualizarCarta(id, { status }))
    );
    const ok = resultados.filter((r) => r.status === "fulfilled").length;
    const falhas = resultados.length - ok;

    if (falhas === 0) {
      setAviso(`${ok} carta(s) ${verbo}.`);
    } else {
      setErro(
        `${ok} de ${resultados.length} atualizada(s). ${falhas} falhou/falharam — a lista foi recarregada.`
      );
    }
    setProcessando(false);
    carregar();
  }

  const subtitulo = useMemo(
    () =>
      `${contagens.pendente} pendente(s) · ${contagens.aprovada} aprovada(s) · ${contagens.recusada} recusada(s)`,
    [contagens]
  );

  return (
    <div className={styles.pagina}>
      <h1 className={styles.titulo}>Cartas à redação</h1>
      <p className={styles.subtitulo}>{subtitulo}</p>

      <div className={styles.filtros}>
        <div className={styles.busca}>
          <input
            placeholder="buscar por assinante ou trecho"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        {FILTROS.map((f) => (
          <button
            key={f.rotulo}
            className={`mono ${styles.chip} ${filtroAtivo === f.valor ? styles.chipAtivo : ""}`}
            onClick={() => setFiltroAtivo(f.valor)}
          >
            {f.rotulo}
          </button>
        ))}
      </div>

      {erro && <p className={styles.mensagemErro}>{erro}</p>}
      {aviso && <p className={styles.mensagemOk}>{aviso}</p>}

      {selecionadas.size > 0 && (
        <div className={`mono ${styles.barraSelecao}`}>
          <p>{selecionadas.size} SELECIONADA(S)</p>
          <div className={styles.acoesEmMassa}>
            <button
              disabled={processando}
              onClick={() => definirStatus([...selecionadas], "aprovada")}
            >
              APROVAR
            </button>
            <button
              disabled={processando}
              onClick={() => definirStatus([...selecionadas], "recusada")}
            >
              RECUSAR
            </button>
            <button onClick={() => setSelecionadas(new Set())}>LIMPAR SELEÇÃO</button>
          </div>
        </div>
      )}

      <div className={styles.lista}>
        {carregando && <p className={styles.mensagem}>Carregando…</p>}
        {!carregando && cartas.length === 0 && (
          <p className={styles.mensagem}>Nenhuma carta encontrada.</p>
        )}
        {cartas.map((carta) => (
          <div key={carta.id} className={`${glass.vidro} ${styles.carta}`}>
            <div className={`${glass.vidroConteudo} ${styles.cartaConteudo}`}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={selecionadas.has(carta.id)}
                onChange={() => alternarSelecao(carta.id)}
              />
              <div className={styles.meta}>
                <p className="mono">
                  {carta.assinante_numero} · {carta.assinante_nome}
                </p>
                <p className={`mono ${styles.metaTempo}`}>{tempoRelativo(carta.criado_em)}</p>
              </div>
              <div className={styles.corpo}>
                <p className={`mono ${styles.assunto}`}>{carta.assunto}</p>
                <p className={styles.texto}>&ldquo;{carta.texto}&rdquo;</p>
              </div>
              <div className={styles.acoes}>
                {carta.status !== "aprovada" && (
                  <button
                    className={`mono ${styles.acaoAprovar}`}
                    disabled={processando}
                    onClick={() => definirStatus([carta.id], "aprovada")}
                  >
                    APROVAR
                  </button>
                )}
                {carta.status !== "recusada" && (
                  <button
                    className={`mono ${styles.acaoRecusar}`}
                    disabled={processando}
                    onClick={() => definirStatus([carta.id], "recusada")}
                  >
                    RECUSAR
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!carregando && (
        <p className={`mono ${styles.paginacao}`}>
          MOSTRANDO 1–{cartas.length} DE {cartas.length}{" "}
          {filtroAtivo ? FILTROS.find((f) => f.valor === filtroAtivo)?.rotulo.toLowerCase() : "cartas"}
        </p>
      )}
    </div>
  );
}

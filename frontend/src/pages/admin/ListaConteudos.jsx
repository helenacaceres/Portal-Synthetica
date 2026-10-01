import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { atualizarConteudo, excluirConteudo, listarConteudos } from "../../api/client";
import ConfirmarExclusaoModal from "../../components/ConfirmarExclusaoModal";
import glass from "../../styles/glass.module.css";
import styles from "./ListaConteudos.module.css";

const EDITORIAS_FILTRO = ["TODAS", "AVANÇOS", "CULTURA", "ÉTICA", "MEMÓRIA"];
const STATUS_FILTRO = [
  { valor: "TODOS", rotulo: "TODOS", api: undefined },
  { valor: "RASCUNHO", rotulo: "RASCUNHOS", api: "rascunho" },
  { valor: "PUBLICADO", rotulo: "PUBLICADOS", api: "publicado" },
];
const ORDENACOES = [
  { valor: "recentes", rotulo: "MAIS RECENTES" },
  { valor: "mais_comentados", rotulo: "MAIS COMENTADOS" },
  { valor: "titulo", rotulo: "TÍTULO (A-Z)" },
];
const POR_PAGINA = 25;

function formatarData(iso) {
  return new Date(iso)
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    .replace(".", "")
    .toUpperCase();
}

export default function ListaConteudos() {
  const navigate = useNavigate();
  const [conteudos, setConteudos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState("");
  const [editoriaAtiva, setEditoriaAtiva] = useState("TODAS");
  const [statusAtivo, setStatusAtivo] = useState("TODOS");
  const [ordenacao, setOrdenacao] = useState("recentes");
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [selecionados, setSelecionados] = useState(new Set());
  const [paraExcluir, setParaExcluir] = useState(null);
  const [processandoAcaoEmMassa, setProcessandoAcaoEmMassa] = useState(false);
  const [aviso, setAviso] = useState(null);

  // READ do CRUD: busca/editoria/status/ordenar/página viram query params
  // pro GET /conteudos — filtro, ordenação e paginação de verdade acontecem
  // no backend, aqui só monta a chamada e guarda o que ele devolve.
  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      const filtroEditoria = editoriaAtiva === "TODAS" ? undefined : editoriaAtiva;
      const filtroStatus = STATUS_FILTRO.find((s) => s.valor === statusAtivo)?.api;
      const resposta = await listarConteudos({
        busca: busca || undefined,
        editoria: filtroEditoria,
        status: filtroStatus,
        ordenar: ordenacao,
        pagina,
        porPagina: POR_PAGINA,
      });
      setConteudos(resposta.itens);
      setTotal(resposta.total);
      setTotalPaginas(resposta.total_paginas);
      setSelecionados(new Set());
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
  }, [busca, editoriaAtiva, statusAtivo, ordenacao, pagina]);

  useEffect(() => {
    setPagina(1);
  }, [busca, editoriaAtiva, statusAtivo, ordenacao]);

  const totalRascunhos = useMemo(
    () => conteudos.filter((c) => c.status === "rascunho").length,
    [conteudos]
  );

  function alternarSelecao(id) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  // DELETE do CRUD — só roda depois que o ConfirmarExclusaoModal confirma,
  // pra não apagar um conteúdo por clique acidental no botão EXCLUIR.
  async function confirmarExclusao(id) {
    try {
      await excluirConteudo(id);
      setParaExcluir(null);
      setAviso("Conteúdo excluído.");
      carregar();
    } catch (e) {
      setParaExcluir(null);
      setErro(e.message);
    }
  }

  async function executarAcaoEmMassa(acao) {
    const ids = [...selecionados];
    if (ids.length === 0) return;
    setProcessandoAcaoEmMassa(true);
    setErro(null);
    setAviso(null);

    const chamada = (id) => {
      if (acao === "publicar") return atualizarConteudo(id, { status: "publicado" });
      if (acao === "rascunho") return atualizarConteudo(id, { status: "rascunho" });
      if (acao === "excluir") return excluirConteudo(id);
      return Promise.reject(new Error("Ação desconhecida"));
    };

    // allSettled: se um id falhar (ex.: outro editor já apagou), as outras
    // ações não são desfeitas — a lista sempre recarrega e o admin vê
    // quantas passaram e quantas falharam.
    const resultados = await Promise.allSettled(ids.map(chamada));
    const ok = resultados.filter((r) => r.status === "fulfilled").length;
    const falhas = resultados.length - ok;

    if (falhas === 0) {
      setAviso(`${ok} conteúdo(s) atualizado(s).`);
    } else {
      setErro(
        `${ok} de ${resultados.length} aplicada(s). ${falhas} falhou/falharam ` +
          `(pode ter sido alterada por outra pessoa) — a lista foi recarregada.`
      );
    }
    setProcessandoAcaoEmMassa(false);
    carregar();
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.cabecalho}>
        <div>
          <h1 className={styles.titulo}>Conteúdos</h1>
          <p className={`mono ${styles.subtitulo}`}>
            {total} matéria(s) no acervo · {totalRascunhos} rascunho(s) nesta página
          </p>
        </div>
        <button className={`mono ${styles.botaoNovo}`} onClick={() => navigate("novo")}>
          + NOVO CONTEÚDO
        </button>
      </div>

      <div className={styles.filtros}>
        <div className={styles.busca}>
          <input
            placeholder="Buscar por título"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        {EDITORIAS_FILTRO.map((editoria) => (
          <button
            key={editoria}
            className={`mono ${styles.chip} ${editoriaAtiva === editoria ? styles.chipAtivo : ""}`}
            onClick={() => setEditoriaAtiva(editoria)}
          >
            {editoria}
          </button>
        ))}
        <span className={styles.separadorFiltro} aria-hidden="true" />
        {STATUS_FILTRO.map((s) => (
          <button
            key={s.valor}
            className={`mono ${styles.chip} ${statusAtivo === s.valor ? styles.chipAtivo : ""}`}
            onClick={() => setStatusAtivo(s.valor)}
          >
            {s.rotulo}
          </button>
        ))}
      </div>

      <div className={`mono ${styles.linhaResultado}`}>
        <p>
          {total} CONTEÚDOS · MOSTRANDO{" "}
          {total === 0 ? 0 : (pagina - 1) * POR_PAGINA + 1}–
          {Math.min(pagina * POR_PAGINA, total)} · FILTRO: {editoriaAtiva}
          {statusAtivo !== "TODOS" ? ` · ${statusAtivo}` : ""}
        </p>
        <label className={styles.ordenar}>
          ORDENAR:{" "}
          <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
            {ORDENACOES.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </select>
        </label>
      </div>

      {erro && <p className={styles.mensagemErro}>{erro}</p>}
      {aviso && <p className={styles.mensagemOk}>{aviso}</p>}

      {selecionados.size > 0 && (
        <div className={`mono ${styles.barraSelecao}`}>
          <p>{selecionados.size} SELECIONADO(S)</p>
          <div className={styles.acoesEmMassa}>
            <button disabled={processandoAcaoEmMassa} onClick={() => executarAcaoEmMassa("publicar")}>
              PUBLICAR
            </button>
            <button disabled={processandoAcaoEmMassa} onClick={() => executarAcaoEmMassa("rascunho")}>
              MUDAR PARA RASCUNHO
            </button>
            <button
              className={styles.acaoExcluirMassa}
              disabled={processandoAcaoEmMassa}
              onClick={() => executarAcaoEmMassa("excluir")}
            >
              EXCLUIR
            </button>
            <button onClick={() => setSelecionados(new Set())}>LIMPAR</button>
          </div>
        </div>
      )}

      <div className={`${glass.vidro} ${styles.tabela}`}>
        <div className={glass.vidroConteudo}>
          <div className={`mono ${styles.linhaCabecalho}`}>
            <span className={styles.colCheckbox} />
            <span className={styles.colId}>ID</span>
            <span className={styles.colTitulo}>TÍTULO</span>
            <span className={styles.colEditoria}>EDITORIA</span>
            <span className={styles.colStatus}>STATUS</span>
            <span className={styles.colAtualizado}>ATUALIZADO</span>
            <span className={styles.colAcoes}>AÇÕES</span>
          </div>

          {carregando && <p className={styles.mensagem}>Carregando…</p>}
          {!carregando && conteudos.length === 0 && (
            <p className={styles.mensagem}>Nenhum conteúdo encontrado.</p>
          )}

          {conteudos.map((c) => (
            <div key={c.id} className={styles.linha}>
              <span className={styles.colCheckbox}>
                <input
                  type="checkbox"
                  checked={selecionados.has(c.id)}
                  onChange={() => alternarSelecao(c.id)}
                />
              </span>
              <span className={`mono ${styles.colId} ${styles.textoApoio}`}>
                #{String(c.id).padStart(4, "0")}
              </span>
              <button
                className={styles.colTitulo + " " + styles.linkTitulo}
                onClick={() => navigate(`${c.id}/editar`)}
              >
                {c.titulo}
              </button>
              <span className={`mono ${styles.colEditoria} ${styles.textoApoio}`}>
                {c.editoria.nome.toUpperCase()}
              </span>
              <span className={styles.colStatus}>
                <span
                  className={`mono ${styles.selo} ${
                    c.status === "publicado" ? styles.seloPublicado : styles.seloRascunho
                  }`}
                >
                  {c.status === "publicado" ? "PUBLICADO" : "RASCUNHO"}
                </span>
              </span>
              <span className={`mono ${styles.colAtualizado} ${styles.textoApoio}`}>
                {formatarData(c.atualizado_em)}
              </span>
              <span className={styles.colAcoes}>
                <button className={`mono ${styles.acaoEditar}`} onClick={() => navigate(`${c.id}/editar`)}>
                  EDITAR
                </button>
                <button className={`mono ${styles.acaoExcluir}`} onClick={() => setParaExcluir(c)}>
                  EXCLUIR
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>

      {totalPaginas > 1 && (
        <div className={`mono ${styles.paginacao}`}>
          <p>{POR_PAGINA} POR PÁGINA ▾</p>
          <div className={styles.paginas}>
            <button disabled={pagina === 1} onClick={() => setPagina((p) => Math.max(1, p - 1))}>
              ←
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={n === pagina ? styles.paginaAtiva : ""}
                onClick={() => setPagina(n)}
              >
                {n}
              </button>
            ))}
            <button
              disabled={pagina === totalPaginas}
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            >
              →
            </button>
          </div>
        </div>
      )}

      <ConfirmarExclusaoModal
        conteudo={paraExcluir}
        onCancelar={() => setParaExcluir(null)}
        onConfirmar={confirmarExclusao}
      />
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import glass from "../styles/glass.module.css";
import {
  comentar,
  desfavoritar,
  favoritar,
  listarComentarios,
  listarConteudos,
  listarMeusFavoritos,
  obterConteudo,
} from "../api/client";
import { useSessao } from "../contexto/SessaoContext";
import { lerToken } from "../onboarding/sessao";
import luzHalo from "../assets/leitor/luz-halo.svg";
import marcador from "../assets/leitor/marcador.svg";
import styles from "./Leitor.module.css";

const REDUZIDO =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const DUR_SAIDA = 240; // ms — precisa bater com a transição .saiPara* no CSS

export default function Leitor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useSessao();
  const [conteudo, setConteudo] = useState(null);
  const [ordenados, setOrdenados] = useState([]);
  const [erro, setErro] = useState(null);

  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [meusFavoritos, setMeusFavoritos] = useState(new Set());
  const [favoritando, setFavoritando] = useState(false);

  // Animação de virar a página: "saindo" leva a matéria atual pra fora;
  // "entrada" faz a nova entrar pelo lado oposto.
  const [saindo, setSaindo] = useState(null); // "prox" | "ant" | null
  const [entrada, setEntrada] = useState(null); // "prox" | "ant" | null

  // Arrastar o spread pra virar.
  const [arrasteX, setArrasteX] = useState(0);
  const [arrastando, setArrastando] = useState(false);
  const inicioX = useRef(0);

  const indice = ordenados.findIndex((c) => c.id === Number(id));
  const total = ordenados.length;
  const anterior = indice > 0 ? ordenados[indice - 1] : null;
  const proximo = indice >= 0 && indice < total - 1 ? ordenados[indice + 1] : null;

  useEffect(() => {
    // Guarda contra corrida: se o leitor troca de matéria rápido, a resposta
    // lenta de uma requisição antiga não pode sobrescrever a nova.
    let ativo = true;
    setConteudo(null);
    setErro(null);
    setSaindo(null);
    setArrasteX(0);
    setArrastando(false);
    window.scrollTo({ top: 0 });

    obterConteudo(id)
      .then((m) => ativo && setConteudo(m))
      .catch(() => ativo && setErro("Esta matéria não está disponível."));
    listarConteudos({ status: "publicado" })
      .then(({ itens }) => {
        if (ativo) {
          setOrdenados([...itens].sort((a, b) => (a.pagina ?? 999) - (b.pagina ?? 999)));
        }
      })
      .catch(() => ativo && setOrdenados([]));
    listarComentarios(id)
      .then((itens) => ativo && setComentarios(itens))
      .catch(() => ativo && setComentarios([]));

    return () => {
      ativo = false;
    };
  }, [id]);

  // busca os favoritos da conta uma vez que a sessão carrega — dá pra saber
  // se ESSA matéria já está salva sem precisar de um campo no ConteudoOut.
  useEffect(() => {
    if (!usuario) {
      setMeusFavoritos(new Set());
      return undefined;
    }
    let ativo = true;
    listarMeusFavoritos(lerToken())
      .then((itens) => ativo && setMeusFavoritos(new Set(itens.map((c) => c.id))))
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [usuario]);

  async function alternarFavorito() {
    if (!usuario || !conteudo || favoritando) return;
    setFavoritando(true);
    try {
      if (meusFavoritos.has(conteudo.id)) {
        await desfavoritar(lerToken(), conteudo.id);
        setMeusFavoritos((atual) => {
          const novo = new Set(atual);
          novo.delete(conteudo.id);
          return novo;
        });
      } else {
        await favoritar(lerToken(), conteudo.id);
        setMeusFavoritos((atual) => new Set(atual).add(conteudo.id));
      }
    } catch {
      // não é crítico pro resto da leitura — só não atualiza o estado.
    } finally {
      setFavoritando(false);
    }
  }

  async function enviarComentario(e) {
    e.preventDefault();
    const texto = novoComentario.trim();
    if (!texto || enviandoComentario || !conteudo) return;
    setEnviandoComentario(true);
    try {
      const criado = await comentar(lerToken(), conteudo.id, texto);
      setComentarios((atual) => [criado, ...atual]);
      setNovoComentario("");
    } catch {
      // formulário continua com o texto pra pessoa tentar de novo.
    } finally {
      setEnviandoComentario(false);
    }
  }

  function virar(destino, dir) {
    if (!destino || saindo) return;
    setArrasteX(0);
    setArrastando(false);
    if (REDUZIDO) {
      navigate(`/leitura/${destino.id}`);
      return;
    }
    setSaindo(dir);
    setTimeout(() => {
      setEntrada(dir);
      navigate(`/leitura/${destino.id}`);
    }, DUR_SAIDA);
  }

  // Setas do teclado viram a página.
  useEffect(() => {
    function aoTeclar(e) {
      if (e.key === "ArrowRight") virar(proximo, "prox");
      else if (e.key === "ArrowLeft") virar(anterior, "ant");
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anterior, proximo, saindo]);

  function aoPressionar(e) {
    if (REDUZIDO || saindo || e.target.closest("button")) return;
    inicioX.current = e.clientX;
    setArrastando(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function aoMover(e) {
    if (!arrastando) return;
    let dx = (e.clientX - inicioX.current) * 0.5;
    if ((dx < 0 && !proximo) || (dx > 0 && !anterior)) dx *= 0.15; // resistência sem destino
    setArrasteX(Math.max(-170, Math.min(170, dx)));
  }

  function aoSoltar() {
    if (!arrastando) return;
    setArrastando(false);
    if (arrasteX <= -100 && proximo) virar(proximo, "prox");
    else if (arrasteX >= 100 && anterior) virar(anterior, "ant");
    else setArrasteX(0);
  }

  if (erro) {
    return (
      <div className={styles.pagina}>
        <BarraTopo navigate={navigate} />
        <div className={`${glass.vidro} ${styles.aviso}`}>
          <div className={glass.vidroConteudo}>
            <p className={`mono ${styles.avisoTexto}`}>{erro}</p>
            <button className={`mono ${styles.voltar}`} onClick={() => navigate("/sumario")}>
              VOLTAR AO SUMÁRIO
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!conteudo) {
    return (
      <div className={styles.pagina}>
        <BarraTopo navigate={navigate} />
        <div className={`${glass.vidro} ${styles.spread} ${styles.spreadCarregando}`}>
          <div className={glass.vidroConteudo}>
            <p className={`mono ${styles.avisoTexto}`}>Abrindo a página…</p>
          </div>
        </div>
      </div>
    );
  }

  const paginaAtual = conteudo.pagina ?? 1;
  const paginaTotalEdicao = Math.max(paginaAtual, ...ordenados.map((c) => c.pagina ?? 0)) || paginaAtual;
  const paginaFimMateria = proximo?.pagina != null ? proximo.pagina - 1 : paginaTotalEdicao;
  const progresso = paginaTotalEdicao > 0 ? Math.round((paginaAtual / paginaTotalEdicao) * 100) : 0;

  const paragrafos = conteudo.corpo.split(/\n+/).filter(Boolean);
  const meio = Math.ceil(paragrafos.length / 2);
  const primeiraMetade = paragrafos.slice(0, meio);
  const segundaMetade = paragrafos.slice(meio);

  const classeSpread = [
    glass.vidro,
    styles.spread,
    saindo === "prox" ? styles.saiParaEsquerda : "",
    saindo === "ant" ? styles.saiParaDireita : "",
    !saindo && entrada === "prox" ? styles.entraDaDireita : "",
    !saindo && entrada === "ant" ? styles.entraDaEsquerda : "",
    !arrastando && !saindo ? styles.spreadSolto : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.pagina}>
      <img src={luzHalo} alt="" className={styles.halo} />

      <BarraTopo navigate={navigate}>
        <div className={styles.ferramentas}>
          <button type="button" className={`mono ${styles.ferramenta}`} disabled title="Em breve">
            Aa
          </button>
          <button
            type="button"
            className={`mono ${styles.ferramenta} ${
              meusFavoritos.has(conteudo.id) ? styles.ferramentaAtiva : ""
            }`}
            onClick={alternarFavorito}
            disabled={!usuario || favoritando}
            title={usuario ? "Favoritar esta matéria" : "Entre na sua conta pra favoritar"}
          >
            {meusFavoritos.has(conteudo.id) ? "★ SALVO" : "☆ SALVAR"}
          </button>
          <span className={`mono ${styles.paginas}`}>
            {paginaFimMateria > paginaAtual ? `${paginaAtual}-${paginaFimMateria}` : paginaAtual} /{" "}
            {paginaTotalEdicao}
          </span>
        </div>
      </BarraTopo>

      {anterior && <div className={`${styles.espiada} ${styles.espiadaEsquerda}`} />}
      {proximo && <div className={`${styles.espiada} ${styles.espiadaDireita}`} />}

      <div
        key={id}
        className={classeSpread}
        style={arrastando ? { transform: `translateX(${arrasteX}px)` } : undefined}
        onPointerDown={aoPressionar}
        onPointerMove={aoMover}
        onPointerUp={aoSoltar}
        onPointerCancel={aoSoltar}
        onAnimationEnd={() => entrada && setEntrada(null)}
      >
        <div className={`${glass.vidroConteudo} ${styles.spreadConteudo}`}>
          <div className={styles.pagEsquerda}>
            <p className={`mono ${styles.rotuloCapa}`}>
              MATÉRIA {conteudo.editoria.nome.toUpperCase()} · P. {conteudo.pagina ?? "—"}
            </p>
            <h1 className={styles.titulo}>{conteudo.titulo}</h1>
            <p className={`mono ${styles.autoria}`}>
              POR {conteudo.autor.nome.toUpperCase()} · {conteudo.tempo_leitura_min} MIN
            </p>
            <p className={styles.lead}>{conteudo.chamada}</p>
            {primeiraMetade.map((p, i) => (
              <p key={i} className={styles.corpo}>
                {p}
              </p>
            ))}
          </div>
          <div className={styles.vinco} />
          <div className={styles.pagDireita}>
            <div className={styles.gradienteAnimado}>
              {conteudo.imagem_url && <img src={conteudo.imagem_url} alt="" />}
            </div>
            <p className={`mono ${styles.figura}`}>Fig. 01 · Estudo de forma para esta matéria</p>
            {segundaMetade.map((p, i) => (
              <p key={i} className={styles.corpo}>
                {p}
              </p>
            ))}
            <div className={styles.justificativa}>
              <span className="mono">POR QUE ESTA MATÉRIA</span>
              <span className={`mono ${styles.justificativaTexto}`}>
                palavra-chave: {conteudo.palavra_chave}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={`${glass.vidro} ${styles.arraste}`}>
        <div className={glass.vidroConteudo}>
          <button
            className={styles.setaPagina}
            disabled={!anterior || Boolean(saindo)}
            onClick={() => virar(anterior, "ant")}
          >
            ←
          </button>
          <span className="mono">
            {anterior || proximo ? "ARRASTE OU USE ← → PARA VIRAR A PÁGINA" : "ÚLTIMA PÁGINA DA EDIÇÃO"}
          </span>
          <button
            className={styles.setaPagina}
            disabled={!proximo || Boolean(saindo)}
            onClick={() => virar(proximo, "prox")}
          >
            →
          </button>
        </div>
      </div>

      <div className={styles.progresso}>
        <span className={`mono ${styles.progressoLabel}`}>P. {paginaAtual}</span>
        <div className={styles.progressoTrilho}>
          <div className={styles.progressoPercorrido} style={{ width: `${progresso}%` }} />
          <img src={marcador} alt="" className={styles.marcador} style={{ left: `${progresso}%` }} />
        </div>
        <span className={`mono ${styles.progressoLabel}`}>P. {paginaTotalEdicao}</span>
      </div>

      <div className={`${glass.vidro} ${styles.comentarios}`}>
        <div className={glass.vidroConteudo}>
          <h2 className={styles.comentariosTitulo}>Comentários ({comentarios.length})</h2>

          {usuario ? (
            <form className={styles.comentarioForm} onSubmit={enviarComentario}>
              <textarea
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                placeholder="O que você achou dessa matéria?"
              />
              <button
                type="submit"
                className={`mono ${styles.comentarioEnviar}`}
                disabled={!novoComentario.trim() || enviandoComentario}
              >
                {enviandoComentario ? "ENVIANDO…" : "COMENTAR"}
              </button>
            </form>
          ) : (
            <p className={styles.comentarioAvisoLogin}>
              <Link to="/login">Entre na sua conta</Link> pra comentar e favoritar matérias.
            </p>
          )}

          <div className={styles.listaComentarios}>
            {comentarios.length === 0 && (
              <p className={styles.comentarioTexto}>
                Nenhum comentário ainda — seja a primeira pessoa.
              </p>
            )}
            {comentarios.map((c) => (
              <div key={c.id} className={styles.comentarioItem}>
                <p className={`mono ${styles.comentarioMeta}`}>
                  <span>{c.usuario.nome.toUpperCase()}</span>
                  <span>{new Date(c.criado_em).toLocaleDateString("pt-BR")}</span>
                </p>
                <p className={styles.comentarioTexto}>{c.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BarraTopo({ navigate, children }) {
  return (
    <div className={`${glass.vidro} ${styles.barra}`}>
      <div className={glass.vidroConteudo}>
        <button className={`mono ${styles.voltar}`} onClick={() => navigate("/sumario")}>
          ← SUMÁRIO
        </button>
        <p className={`mono ${styles.marca}`}>SYNTHETICA · EDIÇÃO #07</p>
        {children ?? <span />}
      </div>
    </div>
  );
}

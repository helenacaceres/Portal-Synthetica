import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import glass from "../styles/glass.module.css";
import { listarConteudos } from "../api/client";
import { lerPreferencias } from "../onboarding/preferencias";
import { useSessao } from "../contexto/SessaoContext";
import logo from "../assets/home/logo.svg";
import styles from "./Home.module.css";

const BARRAS = [6, 2, 4, 2, 8, 2, 2, 4, 6, 2, 4, 2, 2, 6, 2, 4, 2, 6, 2, 2, 4, 2, 6, 2, 2, 4, 6, 2, 2, 4, 2];

// Primeira página da edição: manchete de capa em destaque + o resto do
// sumário numa lista enxuta. A "capa" propriamente dita é a rota /capa.
export default function Home() {
  const navigate = useNavigate();
  const { usuario } = useSessao();
  const [divisoria, setDivisoria] = useState(lerPreferencias().proporcaoAvancos ?? 62);
  const [conteudos, setConteudos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;
    listarConteudos({ status: "publicado" })
      .then(({ itens }) => {
        if (ativo) {
          setConteudos([...itens].sort((a, b) => (a.pagina ?? 999) - (b.pagina ?? 999)));
        }
      })
      .catch(() => ativo && setErro(true))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  // Com sessão, a proporção que vale é a do servidor (a Ficha grava lá).
  useEffect(() => {
    if (usuario?.proporcao_avancos != null) setDivisoria(usuario.proporcao_avancos);
  }, [usuario]);

  const capa = conteudos[0];
  const resto = conteudos.slice(1);

  return (
    <div className={styles.pagina}>
      <div className={styles.topbar}>
        <button className={styles.marca} onClick={() => navigate("/capa")}>
          <span className={styles.logoBadge}>
            <img src={logo} alt="" />
          </span>
          <div className="mono">
            <p>REVISTA</p>
            <p>SYNTHETICA</p>
          </div>
        </button>
        <nav className={styles.nav}>
          <button onClick={() => navigate("/sumario")}>PESQUISA</button>
          <button onClick={() => navigate("/sumario")}>REPORTAGENS</button>
          <button onClick={() => navigate("/sumario")}>ENSAIOS</button>
          <button onClick={() => navigate("/sumario")}>COLUNAS</button>
        </nav>
        <div className={styles.navDireita}>
          <button onClick={() => navigate("/")}>SOBRE</button>
          <button onClick={() => navigate("/sumario")}>SUMÁRIO</button>
          <button onClick={() => navigate("/checkout")}>APOIE</button>
        </div>
      </div>

      <main className={styles.corpo}>
        <header className={styles.cabecalho}>
          <p className={`mono ${styles.meta}`}>
            EDIÇÃO #07 · AGO 2047 · DISTRIBUIÇÃO PERSONALIZADA
          </p>
          <div className={styles.proporcao}>
            <div className={styles.proporcaoBarra}>
              <span style={{ width: `${divisoria}%` }} />
              <span style={{ width: `${100 - divisoria}%` }} />
            </div>
            <div className={`mono ${styles.proporcaoLabels}`}>
              <span>{divisoria}% AVANÇOS</span>
              <span>{100 - divisoria}% CULTURA</span>
            </div>
          </div>
        </header>

        {erro && (
          <div className={styles.estado} role="alert">
            <p>Não foi possível carregar a edição.</p>
            <button className={`mono ${styles.tentarNovamente}`} onClick={() => window.location.reload()}>
              TENTAR DE NOVO
            </button>
          </div>
        )}

        {!erro && capa && (
          <button
            className={`${glass.vidro} ${styles.hero}`}
            onClick={() => navigate(`/leitura/${capa.id}`)}
          >
            <div className={`${glass.vidroConteudo} ${styles.heroConteudo}`}>
              <div className={styles.heroTextos}>
                <p className={`mono ${styles.heroRotulo}`}>MATÉRIA DE CAPA · {capa.editoria.nome.toUpperCase()}</p>
                <h1 className={styles.heroTitulo}>{capa.titulo}</h1>
                <p className={styles.heroOlho}>{capa.chamada}</p>
                <p className={`mono ${styles.heroAutoria}`}>
                  POR {capa.autor.nome.toUpperCase()} · {capa.tempo_leitura_min} MIN
                </p>
                <span className={`mono ${styles.heroLer}`}>LER MATÉRIA →</span>
              </div>
              <div className={styles.heroMedia}>
                {capa.imagem_url ? (
                  <img src={capa.imagem_url} alt="" />
                ) : (
                  <>
                    <div className={styles.heroGradiente} />
                    <span className={`mono ${styles.heroFig}`}>Fig. 01 · estudo de forma</span>
                  </>
                )}
              </div>
            </div>
          </button>
        )}

        <ol className={styles.lista}>
          {carregando && <li className={styles.aviso}>Fechando a edição…</li>}
          {!carregando && !erro && conteudos.length === 0 && (
            <li className={styles.aviso}>Nenhuma matéria publicada ainda.</li>
          )}
          {resto.map((c) => (
            <li key={c.id}>
              <button
                className={`${glass.vidro} ${styles.item}`}
                onClick={() => navigate(`/leitura/${c.id}`)}
              >
                <div className={`${glass.vidroConteudo} ${styles.itemConteudo}`}>
                  <span className={`mono ${styles.itemMeta}`}>
                    P.{String(c.pagina ?? "—").padStart(2, "0")} · {c.editoria.nome.toUpperCase()}
                  </span>
                  <span className={styles.itemTitulo}>{c.titulo}</span>
                  <span className={styles.itemOlho}>{c.chamada}</span>
                  <span className={`mono ${styles.itemTempo}`}>{c.tempo_leitura_min} MIN</span>
                </div>
              </button>
            </li>
          ))}
        </ol>

        <footer className={styles.rodape}>
          <div className={styles.barras}>
            {BARRAS.map((largura, i) => (
              <span key={i} style={{ width: `${largura}px`, height: `${16 + (i % 3) * 5}px` }} />
            ))}
          </div>
          <p className="mono">7 899999 070200</p>
        </footer>
      </main>
    </div>
  );
}

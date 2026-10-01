import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import glass from "../styles/glass.module.css";
import { listarConteudos } from "../api/client";
import objetoCromado from "../assets/login/objeto-cromado.png";
import ImagemConteudo from "../components/ImagemConteudo";
import LiquidLens from "../components/LiquidLens/LiquidLens";
import GlitchText from "../components/glitch/GlitchText";
import GlitchWordmark from "../components/glitch/GlitchWordmark";
import {
  EIXOS,
  EQUIPE,
  FAQ,
  PASSOS,
  PLANOS,
  RODAPE_COLUNAS,
  REDES_SOCIAIS,
  VALORES,
  BYLINE_POR_TITULO,
} from "./dadosComerciais";
import styles from "./HomeComercial.module.css";

export default function HomeComercial() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [destaques, setDestaques] = useState([]);
  const [emailNewsletter, setEmailNewsletter] = useState("");
  const [newsletterEnviada, setNewsletterEnviada] = useState(false);

  useEffect(() => {
    document.title = "Arte e tecnologia: revista de inteligência artificial | Synthetica";
    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
      descriptionTag.setAttribute(
        "content",
        "Explore arte e tecnologia, IA na arte, IA na música, arte generativa e cinema em uma revista digital com curadoria humana.",
      );
    }
    const canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalTag) canonicalTag.setAttribute("href", "https://synthetica-revista.vercel.app/");

    // Mesma fonte que o leitor: assim os ids dos cards "Nesta edição"
    // batem com o que /leitura/:id abre.
    let ativo = true;
    listarConteudos({ status: "publicado" })
      .then(({ itens }) => ativo && setDestaques(itens.slice(0, 3)))
      .catch(() => ativo && setDestaques([]));
    return () => {
      ativo = false;
    };
  }, []);

  function enviarNewsletter(e) {
    e.preventDefault();
    // Protótipo acadêmico: não existe serviço de e-mail integrado, isso só
    // simula a confirmação visual do cadastro.
    setNewsletterEnviada(true);
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.halo} />

      <LiquidLens limiteRef={heroRef} />

      {/* NAV */}
      <div className={`${glass.vidro} ${glass.pilula} ${styles.nav}`}>
        <div className={glass.vidroConteudo}>
          <GlitchText as="p" className={`mono ${styles.navMarca}`} aoPassarMouse automatico={false}>
            SYNTHETICA
          </GlitchText>
          <nav className={`mono ${styles.navLinks}`}>
            <a href="#nesta-edicao">PESQUISA</a>
            <Link to="/sumario">REPORTAGENS</Link>
            <a href="#redacao">ENSAIOS</a>
            <a href="#faq">COLUNAS</a>
            <a href="#planos">EDIÇÕES</a>
            <Link to="/inteligencia-artificial-na-arte-e-cultura">GUIA</Link>
          </nav>
          <button className={`mono ${styles.navCta}`} onClick={() => navigate("/checkout")}>
            ASSINAR
          </button>
        </div>
      </div>

      {/* HERO */}
      <section ref={heroRef} className={styles.hero}>
        <p className={`mono ${styles.heroMeta}`}>
          <span>REVISTA DE INTELIGÊNCIA ARTIFICIAL</span>
          <GlitchText intensidade={0.7} intervaloMinMs={13000} intervaloMaxMs={28000}>
            EDIÇÃO #07
          </GlitchText>
          <span>AGO 2047</span>
          <span>2.400+ ASSINANTES</span>
        </p>

        <GlitchWordmark texto="SYNTHETICA" className={styles.wordmarkFaixa} />

        <div className={styles.heroGrade}>
          <div className={styles.heroTexto}>
            <h1 className={styles.h1}>
              A revista de{" "}
              <GlitchText intensidade={0.8} intervaloMinMs={15000} intervaloMaxMs={32000}>
                inteligência artificial
              </GlitchText>
              <br />
              escrita por humanos e
              <br />
              selecionada para você
            </h1>
            <p className={styles.subheadline}>
              Nossa redação contrata jornalistas, ensaístas e designers para produzir as matérias
              sobre IA na arte e cultura e sobre avanços tecnológicos em IA. A inteligência
              artificial não escreve nenhuma linha: ela só monta a edição que faz sentido para
              você, e mostra o porquê de cada escolha.
            </p>
            <div className={styles.ctas}>
              <button className={`mono ${styles.ctaPrimario}`} onClick={() => navigate("/checkout")}>
                ASSINAR POR R$ 19/MÊS
              </button>
              <button className={`mono ${styles.ctaSecundario}`} onClick={() => navigate("/capa")}>
                VER EDIÇÃO DE EXEMPLO
              </button>
            </div>
            <p className={`mono ${styles.trust}`}>
              Matérias escritas por humanos · 7 dias grátis · assinatura de revista digital sem
              fidelidade
            </p>
          </div>

          <div className={styles.introColuna}>
            <div className={`${glass.vidro} ${styles.introCard}`}>
              <p className={`${glass.vidroConteudo} ${styles.introTexto}`}>
                Cada leitor recebe uma edição diferente. A curadoria não é oculta: ao lado de cada
                matéria, a redação artificial mostra o motivo da escolha e o sinal de leitura que a
                produziu. Você pode apagar qualquer sinal.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.eixos}>
          {EIXOS.map((eixo) => (
            <span key={eixo} className={`mono ${styles.eixoPill}`}>
              {eixo}
            </span>
          ))}
        </div>
      </section>

      {/* CAPA EM DESTAQUE */}
      <section className={`${glass.vidro} ${styles.capa}`}>
        <div className={`${glass.vidroConteudo} ${styles.capaConteudo}`}>
          <div className={styles.capaTexto}>
            <p className={`mono ${styles.capaRotulo}`}>MATÉRIA DE CAPA</p>
            <h2 className={styles.capaTitulo}>O futuro já foi imaginado antes</h2>
            <p className={styles.capaCorpo}>
              Das fitas de celulose às redes neurais, a ficção científica traçou um mapa que a
              realidade teima em seguir. Mas o que acontece quando a imaginação se esgota antes da
              tecnologia?
            </p>
            <div className={styles.capaJustificativa}>
              <span className="mono">POR QUE ESTA MATÉRIA</span>
              <span>seu histórico de leitura sobre IA e cultura visual</span>
            </div>
          </div>
          <img
            src={objetoCromado}
            alt="Objeto cromado que ilustra a relação entre imaginação e tecnologia"
            className={styles.capaImagem}
          />
        </div>
      </section>

      {/* CARDS DE VALOR */}
      <section className={styles.valores}>
        {VALORES.map((v) => (
          <div key={v.titulo} className={`${glass.vidro} ${styles.valorCard}`}>
            <div className={glass.vidroConteudo}>
              <p className={`mono ${styles.valorRotulo}`}>{v.rotulo}</p>
              <h3 className={styles.valorTitulo}>{v.titulo}</h3>
              <p className={styles.valorTexto}>{v.texto}</p>
              <a href="#como-funciona" className={`mono ${styles.valorLink}`}>
                SAIBA MAIS →
              </a>
            </div>
          </div>
        ))}
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className={styles.secao}>
        <h2 className={styles.h2}>Feita por humanos, selecionada por inteligência artificial</h2>
        <div className={styles.passos}>
          {PASSOS.map((p) => (
            <div key={p.numero} className={styles.passo}>
              <p className={styles.passoNumero}>{p.numero}</p>
              <p className={styles.passoTitulo}>{p.titulo}</p>
              <p className={styles.passoTexto}>{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NESTA EDIÇÃO */}
      <section id="nesta-edicao" className={styles.secao}>
        <GlitchText as="h2" className={styles.h2} aoEntrarNaTela automatico={false}>
          Nesta edição
        </GlitchText>
        <p className={styles.secaoSublinha}>
          Três das quinze matérias publicadas em agosto. A sua edição terá seis, escolhidas para o
          seu perfil.
        </p>
        <div className={styles.artigos}>
          {destaques.map((c) => (
            <button
              key={c.id}
              className={`${glass.vidro} ${styles.artigoCard}`}
              onClick={() => navigate(`/leitura/${c.id}`)}
            >
              <div className={glass.vidroConteudo}>
                <div className={styles.artigoFoto}>
                  <ImagemConteudo url={c.imagem_url} alt={c.titulo} />
                </div>
                <p className={`mono ${styles.artigoEditoria}`}>{c.editoria.nome.toUpperCase()}</p>
                <p className={styles.artigoTitulo}>{c.titulo}</p>
                <p className={styles.artigoChamada}>{c.chamada}</p>
                <p className={`mono ${styles.artigoByline}`}>
                  {BYLINE_POR_TITULO[c.titulo] ?? "REDAÇÃO"} · {c.tempo_leitura_min} MIN
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* REDAÇÃO */}
      <section id="redacao" className={styles.secao}>
        <h2 className={styles.h2}>Quem escreve a sua edição</h2>
        <p className={styles.secaoSublinha}>
          Toda matéria é assinada por uma pessoa. Nenhum texto é gerado por máquina em nenhuma
          etapa.
        </p>
        <div className={styles.equipe}>
          {EQUIPE.map((p) => (
            <div key={p.nome} className={styles.perfil}>
              <div className={styles.retrato}>{p.iniciais}</div>
              <p className={styles.perfilNome}>{p.nome}</p>
              <p className={`mono ${styles.perfilCargo}`}>{p.cargo}</p>
              <p className={styles.perfilBio}>{p.bio}</p>
            </div>
          ))}
        </div>
        <a href="#faq" className={`mono ${styles.expedienteLink}`}>
          Ver expediente completo →
        </a>
      </section>

      {/* PLANOS */}
      <section id="planos" className={styles.secao}>
        <h2 className={styles.h2}>Assinatura de revista digital, sem fidelidade</h2>
        <div className={styles.planos}>
          {PLANOS.map((plano) => (
            <div
              key={plano.nome}
              className={`${glass.vidro} ${styles.planoCard} ${
                plano.destaque ? styles.planoDestaque : ""
              }`}
            >
              <div className={glass.vidroConteudo}>
                <p className={`mono ${styles.planoNome}`}>{plano.nome}</p>
                <div className={styles.planoPreco}>
                  <span>{plano.preco}</span>
                  <span>{plano.periodo}</span>
                </div>
                <ul className={styles.planoLista}>
                  {plano.itens.map((item) => (
                    <li key={item}>— {item}</li>
                  ))}
                </ul>
                <button
                  className={`mono ${styles.planoBotao}`}
                  onClick={() => navigate("/checkout")}
                >
                  COMEÇAR AGORA
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className={styles.secao}>
        <h2 className={styles.h2}>Perguntas frequentes</h2>
        <div className={styles.faq}>
          {FAQ.map((item) => (
            <div key={item.pergunta} className={styles.faqItem}>
              <p className={styles.faqPergunta}>{item.pergunta}</p>
              <p className={styles.faqResposta}>{item.resposta}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className={`${glass.vidro} ${styles.newsletter}`}>
        <div className={`${glass.vidroConteudo} ${styles.newsletterConteudo}`}>
          <div className={styles.newsletterTexto}>
            <p className={`mono ${styles.newsletterRotulo}`}>PRÉVIA MENSAL</p>
            <h2 className={styles.newsletterTitulo}>Receba a prévia da edição no seu e-mail</h2>
            <p className={styles.newsletterCorpo}>
              Um resumo do que a redação humana publicou no mês e do que o editor-chefe artificial
              separou. Sem custo e sem cadastro de assinante.
            </p>
          </div>
          {newsletterEnviada ? (
            <p className={styles.newsletterSucesso}>
              Prévia a caminho de {emailNewsletter || "você"}. Confira sua caixa de entrada.
            </p>
          ) : (
            <form onSubmit={enviarNewsletter} className={styles.newsletterForm}>
              <div className={styles.newsletterCampo}>
                <input
                  type="email"
                  required
                  placeholder="seu@e-mail.com"
                  value={emailNewsletter}
                  onChange={(e) => setEmailNewsletter(e.target.value)}
                />
                <button className="mono">CADASTRAR</button>
              </div>
              <p className={styles.newsletterTermos}>
                Li e concordo com a política de privacidade e os termos de uso.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className={styles.rodape}>
        <div className={styles.rodapeTopo}>
          <div className={styles.rodapeMarca}>
            <p className={styles.rodapeMarcaTitulo}>SYNTHETICA</p>
            <p className={styles.rodapeMarcaTexto}>
              Revista de inteligência artificial. Matérias escritas por humanos, edição
              selecionada para cada leitor.
            </p>
            <Link className={styles.rodapeSeoLink} to="/inteligencia-artificial-na-arte-e-cultura">
              Guia de arte e tecnologia →
            </Link>
          </div>
          {RODAPE_COLUNAS.map((coluna) => (
            <div key={coluna.titulo} className={styles.rodapeColuna}>
              <p className={`mono ${styles.rodapeColunaTitulo}`}>{coluna.titulo}</p>
              {coluna.links.map((link) => (
                <p key={link} className={styles.rodapeLink}>
                  {link}
                </p>
              ))}
            </div>
          ))}
        </div>
        <div className={styles.rodapeLinha} />
        <div className={styles.rodapeBase}>
          <p className="mono">© 2047 SYNTHETICA · SÃO PAULO · CNPJ 00.000.000/0001-00</p>
          <div className={`mono ${styles.rodapeSocial}`}>
            {REDES_SOCIAIS.map((rede) => (
              <span key={rede}>{rede}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

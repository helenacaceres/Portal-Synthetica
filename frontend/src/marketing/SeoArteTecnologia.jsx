import { useEffect } from "react";
import { Link } from "react-router-dom";
import objetoCromado from "../assets/login/objeto-cromado.png";
import styles from "./SeoArteTecnologia.module.css";

const canonicalUrl = "https://synthetica-revista.vercel.app/inteligencia-artificial-na-arte-e-cultura";

function atualizarMetadados() {
  const title = "Arte e tecnologia: IA na arte e arte generativa | Synthetica";
  const description =
    "Explore arte e tecnologia com um guia sobre IA na arte, arte generativa, IA na música, IA no cinema e IA na cultura.";
  document.title = title;

  const descriptionTag = document.querySelector('meta[name="description"]');
  if (descriptionTag) descriptionTag.setAttribute("content", description);
  const canonicalTag = document.querySelector('link[rel="canonical"]');
  if (canonicalTag) canonicalTag.setAttribute("href", canonicalUrl);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", title);
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.setAttribute("content", description);
}

export default function SeoArteTecnologia() {
  useEffect(() => {
    atualizarMetadados();
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.logo} to="/" aria-label="Voltar para a home da Synthetica">
          SYNTHETICA
        </Link>
        <nav className={styles.nav} aria-label="Navegação principal">
          <Link to="/">Início</Link>
          <Link to="/capa">Edição de exemplo</Link>
          <Link to="/sumario">Explorar matérias</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <article>
          <div className={styles.eyebrow}>GUIA SYNTHETICA · ARTE, CULTURA E TECNOLOGIA</div>
          <h1>Arte e tecnologia: como a inteligência artificial transforma a cultura</h1>
          <p className={styles.lede}>
            A relação entre arte e tecnologia ficou mais próxima com a popularização da inteligência
            artificial. Neste guia, a Synthetica apresenta caminhos para entender a IA na arte,
            reconhecer experiências de arte generativa e acompanhar as mudanças que já chegaram à
            música, ao cinema e à cultura.
          </p>

          <figure className={styles.figure}>
            <img
              src={objetoCromado}
              alt="Objeto cromado que representa o encontro entre criatividade e tecnologia"
              width="640"
              height="640"
            />
            <figcaption>Uma leitura humana sobre as ferramentas que ampliam a criação.</figcaption>
          </figure>

          <section aria-labelledby="ia-na-arte">
            <h2 id="ia-na-arte">IA na arte: ferramenta, linguagem e processo</h2>
            <p>
              A IA na arte não substitui a intenção de quem cria. Ela pode gerar variações visuais,
              organizar referências, sugerir combinações de som ou acelerar uma etapa repetitiva. O
              resultado depende da direção, da curadoria e do contexto definidos por artistas e
              equipes. Por isso, olhar para autoria, transparência e direitos autorais é tão
              importante quanto observar a novidade técnica.
            </p>
            <h3>O que caracteriza a arte generativa</h3>
            <p>
              A arte generativa usa regras, dados ou modelos para produzir muitas possibilidades a
              partir de um sistema. Em vez de uma única obra fechada, o público pode encontrar
              variações, camadas e resultados que mudam com o tempo. A escolha dos dados e dos
              parâmetros continua sendo uma decisão estética e editorial.
            </p>
          </section>

          <section aria-labelledby="novos-formatos">
            <h2 id="novos-formatos">IA na música, no cinema e na cultura</h2>
            <p>
              Na música, ferramentas de IA ajudam a explorar timbres, arranjos e novas formas de
              interação ao vivo. No cinema, podem apoiar a pré-visualização, a restauração de
              imagens e a criação de efeitos. Em museus e espaços culturais, sistemas generativos
              criam instalações responsivas e experiências que convidam o visitante a participar.
            </p>
            <p>
              Essas aplicações também levantam perguntas sobre representação, acesso e remuneração.
              Uma cobertura responsável explica como a tecnologia foi usada, quem participou da
              criação e quais limites foram considerados. Esse olhar crítico transforma uma lista de
              novidades em repertório para decisões mais conscientes.
            </p>
          </section>

          <aside className={styles.callout} aria-label="Como continuar a leitura">
            <strong>Continue explorando</strong>
            <p>
              A Synthetica reúne reportagens, ensaios e colunas sobre IA na cultura com autoria
              identificada e curadoria transparente.
            </p>
            <Link to="/sumario">Ver matérias do acervo →</Link>
          </aside>

          <section aria-labelledby="por-que-ler">
            <h2 id="por-que-ler">Por que acompanhar arte e tecnologia?</h2>
            <p>
              A tecnologia muda a forma de produzir, distribuir e experimentar cultura. Acompanhar
              esse movimento ajuda a identificar oportunidades sem perder de vista a responsabilidade
              humana. Na Synthetica, cada texto combina contexto, exemplos e perguntas para que você
              forme sua própria leitura sobre o futuro da criação.
            </p>
          </section>
        </article>
      </main>

      <footer className={styles.footer}>
        <span>SYNTHETICA · REVISTA DE INTELIGÊNCIA ARTIFICIAL</span>
        <Link to="/">Conheça a plataforma →</Link>
      </footer>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarCartas, listarConteudos, obterEstatisticas } from "../../api/client";
import glass from "../../styles/glass.module.css";
import styles from "./Painel.module.css";

export default function Painel() {
  const [conteudos, setConteudos] = useState([]);
  const [conteudosErro, setConteudosErro] = useState(false);
  // undefined = carregando · null = falhou · número = ok
  const [cartasPendentes, setCartasPendentes] = useState(undefined);
  const [estatisticas, setEstatisticas] = useState(undefined);
  const [estatisticasErro, setEstatisticasErro] = useState(false);

  useEffect(() => {
    let ativo = true;
    listarConteudos()
      .then(({ itens }) => ativo && setConteudos(itens))
      .catch(() => ativo && setConteudosErro(true));
    listarCartas({ status: "pendente" })
      .then((cs) => ativo && setCartasPendentes(cs.length))
      .catch(() => ativo && setCartasPendentes(null));
    obterEstatisticas()
      .then((dados) => ativo && setEstatisticas(dados))
      .catch(() => ativo && setEstatisticasErro(true));
    return () => {
      ativo = false;
    };
  }, []);

  const rascunhos = conteudos.filter((c) => c.status === "rascunho");
  const publicados = conteudos.filter((c) => c.status === "publicado");
  const total = conteudos.length || 1;
  const fracaoPublicadas = publicados.length / total;
  const fracaoRascunho = rascunhos.length / total;

  return (
    <div className={styles.pagina}>
      <h1 className={styles.titulo}>O que precisa de você hoje</h1>
      <p className={styles.subtitulo}>
        Terça, 27 de agosto de 2047 · a edição #08 fecha em 4 dias
      </p>

      {conteudosErro && (
        <p className={styles.subtitulo} role="alert">
          Não foi possível carregar os conteúdos — os números abaixo podem estar desatualizados.
        </p>
      )}

      <div className={styles.alertas}>
        <CartaoAlerta
          numero={rascunhos.length}
          titulo="rascunhos aguardando publicação"
          descricao={
            rascunhos[0] ? `Mais recente: "${rascunhos[0].titulo}"` : "Nenhum rascunho pendente"
          }
          acao="VER CONTEÚDOS"
          destino="/admin/conteudos"
          destacado
        />
        <CartaoAlerta
          numero={cartasPendentes ?? "—"}
          titulo="cartas aguardando moderação"
          descricao={
            cartasPendentes === undefined
              ? "Carregando…"
              : cartasPendentes === null
                ? "Não foi possível carregar a fila"
                : cartasPendentes === 0
                  ? "Fila zerada"
                  : "Moderação define o que vai pro público"
          }
          acao="MODERAR"
          destino="/admin/cartas"
          destacado={Boolean(cartasPendentes)}
        />
        <CartaoAlerta
          numero={publicados.length}
          titulo="matérias publicadas no acervo"
          descricao={`${conteudos.length} conteúdo(s) no total`}
          acao="VER CONTEÚDOS"
          destino="/admin/conteudos"
        />
      </div>

      <div className={styles.linhaInferior}>
        <div className={`${glass.vidro} ${styles.progresso}`}>
          <div className={glass.vidroConteudo}>
            <p className={`mono ${styles.rotulo}`}>EDIÇÃO #08 · FECHA EM 31/08 ÀS 7H</p>
            <div className={styles.barraProgresso}>
              <div className={styles.segmentoPublicado} style={{ flexGrow: fracaoPublicadas || 0.01 }} />
              <div className={styles.segmentoRascunho} style={{ flexGrow: fracaoRascunho || 0.01 }} />
              <div className={styles.segmentoFaltando} style={{ flexGrow: 1 - fracaoPublicadas - fracaoRascunho || 0.01 }} />
            </div>
            <div className={`mono ${styles.legenda}`}>
              <span>{publicados.length} PUBLICADAS</span>
              <span>{rascunhos.length} EM REVISÃO</span>
            </div>
            <p className={styles.nota}>
              Abaixo de 12 matérias publicadas, o editor-chefe não consegue montar edições distintas
              para todos os perfis.
            </p>
          </div>
        </div>

        <div className={`${glass.vidro} ${styles.atividade}`}>
          <div className={glass.vidroConteudo}>
            {estatisticasErro && (
              <p className={`mono ${styles.rotulo}`}>Não foi possível carregar as estatísticas.</p>
            )}

            {estatisticas === undefined && !estatisticasErro && (
              <p className={`mono ${styles.rotulo}`}>Carregando estatísticas…</p>
            )}

            {estatisticas && (
              <>
                <p className={`mono ${styles.rotulo}`}>PUBLICADAS POR EDITORIA</p>
                {estatisticas.conteudos_por_editoria.length === 0 && (
                  <p className={styles.eventoTexto}>Nenhuma matéria publicada ainda.</p>
                )}
                {estatisticas.conteudos_por_editoria.map((e) => (
                  <div key={e.editoria} className={styles.evento}>
                    <p className={`mono ${styles.eventoQuando}`}>{e.editoria.toUpperCase()}</p>
                    <p className={styles.eventoTexto}>{e.total} matéria(s)</p>
                  </div>
                ))}

                <p className={`mono ${styles.rotulo}`}>MAIS COMENTADAS</p>
                {estatisticas.mais_comentados.every((c) => c.total_comentarios === 0) && (
                  <p className={styles.eventoTexto}>Nenhum comentário ainda.</p>
                )}
                {estatisticas.mais_comentados
                  .filter((c) => c.total_comentarios > 0)
                  .map((c) => (
                    <div key={c.id} className={styles.evento}>
                      <p className={`mono ${styles.eventoQuando}`}>{c.total_comentarios} COMENTÁRIO(S)</p>
                      <p className={styles.eventoTexto}>{c.titulo}</p>
                    </div>
                  ))}

                <p className={`mono ${styles.rotulo}`}>LEITORES MAIS ATIVOS</p>
                {estatisticas.usuarios_mais_ativos.length === 0 && (
                  <p className={styles.eventoTexto}>Ninguém comentou ainda.</p>
                )}
                {estatisticas.usuarios_mais_ativos.map((u) => (
                  <div key={u.id} className={styles.evento}>
                    <p className={`mono ${styles.eventoQuando}`}>{u.total_comentarios} COMENTÁRIO(S)</p>
                    <p className={styles.eventoTexto}>{u.nome}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CartaoAlerta({ numero, titulo, descricao, acao, destino, destacado }) {
  return (
    <div className={`${glass.vidro} ${styles.alerta} ${destacado ? styles.alertaDestacado : ""}`}>
      <div className={`${glass.vidroConteudo} ${styles.alertaConteudo}`}>
        <p className={styles.alertaNumero}>{numero}</p>
        <p className={styles.alertaTitulo}>{titulo}</p>
        <p className={styles.alertaDescricao}>{descricao}</p>
        <Link to={destino} className={`mono ${styles.alertaAcao}`}>
          {acao} →
        </Link>
      </div>
    </div>
  );
}

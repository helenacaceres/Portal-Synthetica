import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import glass from "../styles/glass.module.css";
import { apagarSinalAssinante, atualizarPreferenciasAssinante } from "../api/client";
import { lerToken } from "./sessao";
import { useSessao } from "../contexto/SessaoContext";
import styles from "./FichaAssinante.module.css";

// Estes não vêm do banco — são ilustrações do TIPO de sinal que o
// editor-chefe usaria. Ficam marcados como "exemplo" pra não passar por
// dado real (apagar aqui só some da tela, não muda edição nenhuma).
const SINAIS_ESTATICOS = [
  {
    id: "leu",
    grupo: "HISTÓRICO",
    texto: 'Leu "Réplicas e replicantes" até o fim',
    nota: "usado em 2 escolhas",
  },
  {
    id: "favoritou",
    grupo: "HISTÓRICO",
    texto: 'Favoritou "A máquina que aprendeu a ver"',
    nota: "usado em 1 escolha",
  },
  {
    id: "tempoMedio",
    grupo: "COMPORTAMENTO",
    texto: "Lê em média 40 minutos por edição",
    nota: "define o número de páginas",
  },
  {
    id: "diaAbertura",
    grupo: "COMPORTAMENTO",
    texto: "Abre a revista nas manhãs de terça",
    nota: "define o dia do fechamento",
  },
];

export default function FichaAssinante() {
  const navigate = useNavigate();
  const { usuario, carregando, setUsuario, sair } = useSessao();
  const [erro, setErro] = useState(null);
  const [sinaisEstaticosApagados, setSinaisEstaticosApagados] = useState(new Set());

  useEffect(() => {
    if (!carregando && !usuario) {
      navigate("/login");
    }
  }, [carregando, usuario, navigate]);

  async function apagarSinal(campo) {
    try {
      const atualizado = await apagarSinalAssinante(lerToken(), campo);
      setUsuario(atualizado);
    } catch (e) {
      setErro(e.message);
    }
  }

  async function removerTema(tema) {
    const restantes = (usuario.temas ? usuario.temas.split(",").filter(Boolean) : []).filter(
      (t) => t !== tema
    );
    try {
      const atualizado = await atualizarPreferenciasAssinante(lerToken(), { temas: restantes });
      setUsuario(atualizado);
    } catch (e) {
      setErro(e.message);
    }
  }

  function apagarEstatico(id) {
    setSinaisEstaticosApagados((atual) => new Set(atual).add(id));
  }

  if (carregando || !usuario) {
    return (
      <div className={styles.pagina}>
        <p className={`mono ${styles.carregandoTela}`}>Carregando sua ficha…</p>
      </div>
    );
  }

  const assinante = usuario;
  const temas = assinante.temas ? assinante.temas.split(",").filter(Boolean) : [];

  return (
    <div className={styles.pagina}>
      <div className={styles.topbar}>
        <button className={`mono ${styles.marca}`} onClick={() => navigate("/home")}>
          REVISTA SYNTHETICA
        </button>
        <div className={styles.usuarioArea}>
          <p className={`mono ${styles.usuaria}`}>
            {assinante.nome} · ASSINANTE #{String(assinante.id).padStart(4, "0")}
          </p>
          <button className={`mono ${styles.sair}`} onClick={sair}>
            SAIR
          </button>
        </div>
      </div>

      <div className={styles.corpo}>
        <h1 className={styles.titulo}>Ficha do assinante</h1>
        <p className={styles.descricao}>
          Tudo que o editor-chefe usou para fechar a sua edição. Apague o que não quiser: a
          próxima edição muda.
        </p>

        {erro && <p className={styles.erro}>{erro}</p>}

        <div className={styles.colunas}>
          <div className={styles.listaSinais}>
            {assinante.proporcao_avancos != null && (
              <Sinal
                grupo="FICHA"
                texto={`Proporção ${assinante.proporcao_avancos}% avanços / ${
                  100 - assinante.proporcao_avancos
                }% cultura`}
                nota="define a capa e a ordem"
                onApagar={() => apagarSinal("proporcao_avancos")}
              />
            )}
            {temas.length > 0 && (
              <div className={`${glass.vidro} ${styles.sinal}`}>
                <div className={glass.vidroConteudo}>
                  <p className={`mono ${styles.sinalGrupo}`}>FICHA</p>
                  <div className={styles.sinalTexto}>
                    <p>Temas</p>
                    <div className={styles.temasChips}>
                      {temas.map((tema) => (
                        <button
                          key={tema}
                          className={`mono ${styles.temaChip}`}
                          onClick={() => removerTema(tema)}
                          title="Remover este tema"
                        >
                          {tema.toLowerCase()} ✕
                        </button>
                      ))}
                    </div>
                    <p className={`mono ${styles.sinalNota}`}>
                      usado em {temas.length} escolha(s) · clique para remover um
                    </p>
                  </div>
                  <button
                    className={`mono ${styles.sinalApagar}`}
                    onClick={() => apagarSinal("temas")}
                  >
                    APAGAR TODOS
                  </button>
                </div>
              </div>
            )}
            {SINAIS_ESTATICOS.filter((s) => !sinaisEstaticosApagados.has(s.id)).map((s) => (
              <Sinal
                key={s.id}
                grupo={s.grupo}
                texto={s.texto}
                nota={s.nota}
                exemplo
                onApagar={() => apagarEstatico(s.id)}
              />
            ))}
            {assinante.proporcao_avancos == null &&
              temas.length === 0 &&
              sinaisEstaticosApagados.size === SINAIS_ESTATICOS.length && (
                <p className={styles.vazio}>Nenhum sinal ativo — sua próxima edição é a pública.</p>
              )}
          </div>

          <div className={`${glass.vidro} ${styles.painelLateral}`}>
            <div className={glass.vidroConteudo}>
              <p className={`mono ${styles.painelRotulo}`}>EFEITO NA PRÓXIMA EDIÇÃO</p>
              <div className={styles.painelLinha} />
              <p className={styles.painelTexto}>
                Apagando os dois sinais de comportamento, a edição deixa de ajustar o tamanho e o
                dia. Você passa a definir os dois na mão.
              </p>
              <div className={styles.painelLinha} />
              <p className={`mono ${styles.painelRotulo}`}>EDIÇÃO SEM PERSONALIZAÇÃO</p>
              <p className={styles.painelTexto}>
                Apagando tudo, você continua assinante e passa a receber a edição pública, fechada
                pela redação.
              </p>
            </div>
          </div>
        </div>

        <p className={styles.notaFinal}>
          Nenhum destes sinais sai do Synthetica. A edição é montada aqui, com o acervo daqui.
        </p>

        <button className={`mono ${styles.irParaEdicao}`} onClick={() => navigate("/capa")}>
          IR PARA MINHA EDIÇÃO →
        </button>
      </div>
    </div>
  );
}

function Sinal({ grupo, texto, nota, onApagar, exemplo = false }) {
  return (
    <div className={`${glass.vidro} ${styles.sinal}`}>
      <div className={glass.vidroConteudo}>
        <p className={`mono ${styles.sinalGrupo}`}>
          {grupo}
          {exemplo && <span className={styles.sinalExemplo}> · exemplo</span>}
        </p>
        <div className={styles.sinalTexto}>
          <p>{texto}</p>
          <p className={`mono ${styles.sinalNota}`}>{nota}</p>
        </div>
        <button className={`mono ${styles.sinalApagar}`} onClick={onApagar}>
          APAGAR
        </button>
      </div>
    </div>
  );
}

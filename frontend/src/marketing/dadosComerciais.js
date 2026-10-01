export const EIXOS = [
  "IA NA ARTE E CULTURA",
  "AVANÇOS TECNOLÓGICOS EM IA",
  "ÉTICA E PRIVACIDADE",
  "MEMÓRIA",
];

export const VALORES = [
  {
    pagina: "P. 08",
    rotulo: "REDAÇÃO",
    titulo: "Escrita por gente",
    texto: "Jornalistas, ensaístas e designers contratados assinam cada matéria. A IA não redige nada.",
  },
  {
    pagina: "P. 16",
    rotulo: "CURADORIA",
    titulo: "Selecionada para você",
    texto: "Curadoria com inteligência artificial monta sua edição a partir da proporção que você definiu.",
  },
  {
    pagina: "P. 24",
    rotulo: "TRANSPARÊNCIA",
    titulo: "Algoritmo explicável",
    texto: "Cada matéria mostra o critério da escolha e o sinal de leitura que a gerou.",
  },
];

export const PASSOS = [
  {
    numero: "01",
    titulo: "Nossa redação produz",
    texto: "Quinze matérias por mês, escritas e ilustradas por profissionais contratados e creditados.",
  },
  {
    numero: "02",
    titulo: "Você define a proporção",
    texto: "Escolhe quanto quer de cada eixo editorial na sua ficha de assinatura.",
  },
  {
    numero: "03",
    titulo: "A IA seleciona e justifica",
    texto: "O editor-chefe artificial separa seis matérias para o seu perfil e explica cada escolha.",
  },
];

export const EQUIPE = [
  {
    iniciais: "MA",
    nome: "Mariana Aoki",
    cargo: "EDITORA DE CULTURA",
    bio: "Escreve sobre como a imagem gerada por máquina mudou o trabalho de quem desenha.",
  },
  {
    iniciais: "TB",
    nome: "Tomás Beltrão",
    cargo: "REPÓRTER DE TECNOLOGIA",
    bio: "Cobre laboratórios e patentes, e o caminho que elas fazem até chegar na rua.",
  },
  {
    iniciais: "NO",
    nome: "Nádia Okonkwo",
    cargo: "ENSAÍSTA",
    bio: "Pesquisa autoria e trabalho criativo dentro de sistemas automatizados.",
  },
  {
    iniciais: "RS",
    nome: "Rui Sampaio",
    cargo: "DIRETOR DE ARTE",
    bio: "Desenha as aberturas de matéria e o material visual de cada edição.",
  },
];

export const PLANOS = [
  {
    nome: "MENSAL",
    preco: "R$ 19",
    periodo: "/mês",
    itens: [
      "Uma edição fechada por mês",
      "Proporção editável a qualquer momento",
      "Justificativa de IA em cada matéria",
      "Cancele quando quiser",
    ],
  },
  {
    nome: "ANUAL · ECONOMIZE 21%",
    preco: "R$ 179",
    periodo: "/ano",
    destaque: true,
    itens: [
      "Tudo do plano mensal",
      "Acesso ao arquivo completo de edições",
      "Ficha do assinante exportável",
      "Sete dias grátis para testar",
    ],
  },
];

export const FAQ = [
  {
    pergunta: "Quem escreve as matérias do Synthetica?",
    resposta:
      "Jornalistas, ensaístas e designers humanos, contratados e creditados por nome em cada texto. A inteligência artificial não produz conteúdo editorial em nenhuma etapa.",
  },
  {
    pergunta: "Como funciona a curadoria com inteligência artificial?",
    resposta:
      "A IA atua só na seleção: escolhe seis das quinze matérias do mês a partir da proporção que você definiu e do seu histórico de leitura.",
  },
  {
    pergunta: "O que significa algoritmo explicável?",
    resposta:
      "Significa que toda escolha vem acompanhada do critério que a produziu, em texto legível, e que você pode apagar qualquer sinal de leitura.",
  },
  {
    pergunta: "Posso cancelar a assinatura de revista digital?",
    resposta: "Sim, a qualquer momento, sem multa. Os sete primeiros dias são gratuitos em qualquer plano.",
  },
];

export const RODAPE_COLUNAS = [
  { titulo: "REVISTA", links: ["Edições", "Sumário", "Arquivo", "Colunas"] },
  { titulo: "ASSINATURA", links: ["Planos", "Ficha do assinante", "Central de ajuda"] },
  { titulo: "INSTITUCIONAL", links: ["Sobre o portal", "Redação artificial", "Expediente", "Contato"] },
  { titulo: "LEGAL", links: ["Política de privacidade", "Termos de uso", "Preferências de cookies"] },
];

export const REDES_SOCIAIS = ["INSTAGRAM", "X", "YOUTUBE", "LINKEDIN", "TIKTOK"];

/** Bylines editoriais que casam com a seção "Redação" — usadas nos cards
 * de "Nesta edição" quando o conteúdo real correspondente é encontrado. */
export const BYLINE_POR_TITULO = {
  "A máquina que aprendeu a ver": "MARIANA AOKI",
  "Réplicas e replicantes": "TOMÁS BELTRÃO",
  "Quem assina o algoritmo": "NÁDIA OKONKWO",
};

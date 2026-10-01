const CHAVE = "synthetica.ficha";

export const TEMAS_DISPONIVEIS = [
  "CINEMA",
  "MÚSICA",
  "TRABALHO",
  "CIDADE",
  "VIGILÂNCIA",
  "AUTORIA",
  "MEMÓRIA",
  "LINGUAGEM",
  "CORPO",
];

export const OPCOES_TEMPO = [
  { valor: "20min", rotulo: "20 MIN", materias: 3 },
  { valor: "40min", rotulo: "40 MIN", materias: 5 },
  { valor: "1hora", rotulo: "1 HORA", materias: 8 },
  { valor: "sempressa", rotulo: "SEM PRESSA", materias: 12 },
];

const PADRAO = {
  proporcaoAvancos: 62,
  temas: [],
  perfil: "comecando",
  tempo: "40min",
};

export function lerPreferencias() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? { ...PADRAO, ...JSON.parse(bruto) } : { ...PADRAO };
  } catch {
    return { ...PADRAO };
  }
}

export function salvarPreferencias(preferencias) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(preferencias));
  } catch {
    // localStorage indisponível (modo privado, etc.) — segue sem persistir.
  }
}

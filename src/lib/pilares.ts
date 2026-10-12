export type Pilar = {
  slug: string;
  nome: string;
  descricao: string;
  /** id do guia de entrada do pilar */
  comeceAqui?: string;
  icone: string;
};

export const PILARES: Pilar[] = [
  {
    slug: "contratos",
    nome: "Contratos Agrários",
    descricao: "Arrendamento, parceria, cessão de superfície, prazos, preço e notificações.",
    comeceAqui: "contratos-agrarios-visao-geral",
    icone: "contrato",
  },
  {
    slug: "imobiliario",
    nome: "Imobiliário Rural",
    descricao:
      "Matrícula, georreferenciamento, usucapião, desmembramento, condomínio, fronteira e terras públicas.",
    comeceAqui: "imovel-rural-conceitos",
    icone: "mapa",
  },
  {
    slug: "aquisicao",
    nome: "Aquisição de Imóveis",
    descricao: "Due diligence do imóvel e do vendedor, certidões, estrangeiros, leilões e contrato de compra.",
    comeceAqui: "due-diligence-visao-geral",
    icone: "lupa",
  },
  {
    slug: "cadastros",
    nome: "Cadastros Rurais",
    descricao: "CCIR, SNCR, CNIR, CIB, CAFIR, ADA e inscrição estadual do produtor.",
    comeceAqui: "cadastros-visao-geral",
    icone: "ficha",
  },
  {
    slug: "fiscal",
    nome: "Fiscal e Tributário",
    descricao: "ITR, IPTU indevido, ganho de capital, holding, IR do produtor e reforma tributária.",
    comeceAqui: "itr-conceitos",
    icone: "moeda",
  },
  {
    slug: "ambiental",
    nome: "Ambiental",
    descricao: "CAR, APP e reserva legal, uso consolidado, licenciamento, outorga, crimes e autos de infração.",
    comeceAqui: "regularizacao-ambiental-visao-geral",
    icone: "folha",
  },
  {
    slug: "temas-especiais",
    nome: "Temas Especiais",
    descricao:
      "Holding e sucessão, crédito rural, mineração, previdência rural, carbono, possessórias, marinha e honorários.",
    icone: "estrela",
  },
];

export function getPilar(slug: string): Pilar | undefined {
  return PILARES.find((p) => p.slug === slug);
}

export const TIPOS = {
  guia: { rota: "guia", nome: "Guia", plural: "Guias", pasta: "guias" },
  checklist: { rota: "checklist", nome: "Checklist", plural: "Checklists", pasta: "checklists" },
  fluxo: { rota: "fluxo", nome: "Fluxo de decisão", plural: "Fluxos de decisão", pasta: "fluxos" },
  referencia: { rota: "referencia", nome: "Referência", plural: "Tabelas e referências", pasta: "referencias" },
} as const;

export type Tipo = keyof typeof TIPOS;

export function rotaDoItem(tipo: Tipo, id: string): string {
  return `/${TIPOS[tipo].rota}/${id}`;
}

// Tipos compartilhados entre servidor e navegador (sem dependências de Node).

export type TipoCampo =
  | "texto"
  | "texto_longo"
  | "data"
  | "numero"
  | "moeda"
  | "area"
  | "cpf"
  | "cnpj"
  | "cep"
  | "email"
  | "telefone"
  | "opcao"
  | "nota";

export type DefinicaoCampo = {
  rotulo: string;
  grupo: string;
  tipo: TipoCampo;
  dica?: string;
  opcoes?: string[];
};

export type NoDoc = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: NoDoc[];
  text?: string;
  marks?: { type: string }[];
};

export type Modelo = {
  id: string;
  titulo: string;
  tipo: string;
  pilar: string;
  resumo: string;
  relacionados: string[];
  grupos: string[];
  campos: Record<string, DefinicaoCampo>;
  duvidas: string[];
  doc: NoDoc;
};

export type ModeloResumo = Pick<Modelo, "id" | "titulo" | "tipo" | "pilar" | "resumo"> & { nCampos: number };

export const TIPOS_DOCUMENTO: Record<string, { nome: string; plural: string }> = {
  contrato: { nome: "Contrato", plural: "Contratos" },
  requerimento: { nome: "Requerimento", plural: "Requerimentos" },
  procuracao: { nome: "Procuração", plural: "Procurações" },
  notificacao: { nome: "Notificação", plural: "Notificações" },
  escritura: { nome: "Escritura", plural: "Escrituras" },
  declaracao: { nome: "Declaração", plural: "Declarações" },
  "ata-notarial": { nome: "Ata notarial", plural: "Atas notariais" },
  peticao: { nome: "Defesa / petição", plural: "Defesas e petições" },
  proposta: { nome: "Proposta de honorários", plural: "Propostas de honorários" },
  relatorio: { nome: "Relatório", plural: "Relatórios" },
  formulario: { nome: "Formulário", plural: "Formulários" },
  outro: { nome: "Documento", plural: "Outros documentos" },
};

/** Valor como aparece no documento (datas em dd/mm/aaaa, moeda com R$...). */
export function formatarValor(valor: string | undefined, tipo: TipoCampo): string {
  const v = (valor ?? "").trim();
  if (!v) return "";
  if (tipo === "data") {
    const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? `${m[3]}/${m[2]}/${m[1]}` : v;
  }
  return v;
}

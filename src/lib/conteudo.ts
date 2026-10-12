import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";
import { Marked, type Tokens } from "marked";
import { PILARES, TIPOS, rotaDoItem, type Tipo } from "./pilares";

const RAIZ = path.join(process.cwd(), "conteudo");

export type OpcaoFluxo = { rotulo: string; proximo?: string; resultado?: string };
export type PerguntaFluxo = { texto: string; ajuda?: string; opcoes: OpcaoFluxo[] };
export type ResultadoFluxo = { titulo: string; texto: string; links?: string[] };
export type Fluxo = {
  inicio: string;
  perguntas: Record<string, PerguntaFluxo>;
  resultados: Record<string, ResultadoFluxo>;
};

export type Item = {
  id: string;
  titulo: string;
  pilar: string;
  tipo: Tipo;
  resumo: string;
  tags: string[];
  baseLegal: string[];
  relacionados: string[];
  fonte: string;
  revisao: string;
  /** caminho absoluto do arquivo de origem */
  arquivo: string;
  /** markdown sem o frontmatter e sem o título H1 */
  corpo: string;
  fluxo?: Fluxo;
};

export type ItemResumo = Pick<Item, "id" | "titulo" | "pilar" | "tipo" | "resumo">;

type Base = { itens: Item[]; porId: Map<string, Item>; porArquivo: Map<string, Item> };

let cache: Base | null = null;

function lista(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  return [String(v)];
}

function semTitulo(md: string): string {
  return md.replace(/^\s*# .*\n/, "").trim();
}

function carregar(): Base {
  const itens: Item[] = [];
  for (const pilar of PILARES) {
    for (const [tipo, info] of Object.entries(TIPOS) as [Tipo, (typeof TIPOS)[Tipo]][]) {
      const pasta = path.join(RAIZ, pilar.slug, info.pasta);
      if (!fs.existsSync(pasta)) continue;
      for (const nome of fs.readdirSync(pasta).sort()) {
        const arquivo = path.join(pasta, nome);
        const texto = fs.readFileSync(arquivo, "utf8");
        if (nome.endsWith(".md")) {
          const { data, content } = matter(texto);
          itens.push({
            id: String(data.id),
            titulo: String(data.titulo),
            pilar: pilar.slug,
            tipo: (data.tipo as Tipo) ?? tipo,
            resumo: String(data.resumo ?? ""),
            tags: lista(data.tags),
            baseLegal: lista(data.base_legal),
            relacionados: lista(data.relacionados),
            fonte: String(data.fonte ?? ""),
            revisao: String(data.revisao ?? "pendente"),
            arquivo,
            corpo: semTitulo(content),
          });
        } else if (nome.endsWith(".yaml") || nome.endsWith(".yml")) {
          const data = yaml.load(texto) as Record<string, unknown>;
          itens.push({
            id: String(data.id),
            titulo: String(data.titulo),
            pilar: pilar.slug,
            tipo: "fluxo",
            resumo: String(data.resumo ?? ""),
            tags: lista(data.tags),
            baseLegal: [],
            relacionados: [],
            fonte: String(data.fonte ?? ""),
            revisao: String(data.revisao ?? "pendente"),
            arquivo,
            corpo: "",
            fluxo: {
              inicio: String(data.inicio),
              perguntas: (data.perguntas ?? {}) as Fluxo["perguntas"],
              resultados: (data.resultados ?? {}) as Fluxo["resultados"],
            },
          });
        }
      }
    }
  }
  return {
    itens,
    porId: new Map(itens.map((i) => [i.id, i])),
    porArquivo: new Map(itens.map((i) => [i.arquivo, i])),
  };
}

function base(): Base {
  if (!cache || process.env.NODE_ENV === "development") cache = carregar();
  return cache;
}

export function todosItens(): Item[] {
  return base().itens;
}

export function getItem(id: string): Item | undefined {
  return base().porId.get(id);
}

export function itensDoPilar(pilar: string, tipo?: Tipo): Item[] {
  return todosItens().filter((i) => i.pilar === pilar && (!tipo || i.tipo === tipo));
}

export function itensDoTipo(tipo: Tipo): Item[] {
  return todosItens().filter((i) => i.tipo === tipo);
}

export function resumo(i: Item): ItemResumo {
  return { id: i.id, titulo: i.titulo, pilar: i.pilar, tipo: i.tipo, resumo: i.resumo };
}

export function rota(i: Pick<Item, "tipo" | "id">): string {
  return rotaDoItem(i.tipo, i.id);
}

/** Itens relacionados que existem, incluindo quem aponta para este item. */
export function relacionadosDe(item: Item): Item[] {
  const ids = new Set(item.relacionados);
  for (const outro of todosItens()) {
    if (outro.id !== item.id && outro.relacionados.includes(item.id)) ids.add(outro.id);
  }
  ids.delete(item.id);
  return [...ids].map(getItem).filter((i): i is Item => !!i);
}

// ---------- Markdown ----------

export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type Secao = { id: string; titulo: string };

/** Converte link relativo entre arquivos da base em rota do site. */
function resolverLink(href: string, origem: string): string {
  if (/^(https?:|mailto:|#|\/)/.test(href)) return href;
  const [caminho, ancora] = href.split("#");
  const alvo = path.resolve(path.dirname(origem), caminho);
  const item = base().porArquivo.get(alvo);
  if (item) return rota(item) + (ancora ? `#${ancora}` : "");
  const rel = path.relative(RAIZ, alvo);
  const revisao = rel.match(/^([^/]+)\/REVISAO\.md$/);
  if (revisao) return `/revisao/${revisao[1]}`;
  return href;
}

export function renderizar(md: string, origem: string): { html: string; secoes: Secao[] } {
  const secoes: Secao[] = [];
  const usados = new Map<string, number>();
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading(this: { parser: { parseInline(t: Tokens.Generic[]): string } }, { tokens, depth }: Tokens.Heading) {
        const texto = this.parser.parseInline(tokens);
        let id = slugify(texto) || "secao";
        const n = usados.get(id) ?? 0;
        usados.set(id, n + 1);
        if (n) id = `${id}-${n}`;
        if (depth === 2) secoes.push({ id, titulo: texto.replace(/<[^>]+>/g, "") });
        return `<h${depth} id="${id}">${texto}</h${depth}>\n`;
      },
      link(this: { parser: { parseInline(t: Tokens.Generic[]): string } }, { href, title, tokens }: Tokens.Link) {
        const texto = this.parser.parseInline(tokens);
        const destino = resolverLink(href, origem);
        const externo = /^https?:/.test(destino);
        const t = title ? ` title="${title}"` : "";
        return externo
          ? `<a href="${destino}"${t} target="_blank" rel="noopener noreferrer">${texto}</a>`
          : `<a href="${destino}"${t}>${texto}</a>`;
      },
      blockquote(this: { parser: { parse(t: Tokens.Generic[]): string } }, { tokens }: Tokens.Blockquote) {
        const corpo = this.parser.parse(tokens);
        const classe = /Conferir:/.test(corpo) ? "aviso-conferir" : "destaque";
        return `<blockquote class="${classe}">${corpo}</blockquote>\n`;
      },
    },
  });
  const html = (marked.parse(md) as string)
    .replace(/<table>/g, '<div class="tabela"><table>')
    .replace(/<\/table>/g, "</table></div>");
  return { html, secoes };
}

export function renderizarInline(md: string, origem: string): string {
  return renderizar(md, origem).html.replace(/^<p>([\s\S]*)<\/p>\n?$/, "$1");
}

// ---------- Checklists ----------

export type ItemChecklist = { chave: string; html: string; filhos: ItemChecklist[] };
export type BlocoChecklist =
  | { tipo: "itens"; itens: ItemChecklist[] }
  | { tipo: "nota"; html: string };
export type SecaoChecklist = { titulo: string; nivel: number; blocos: BlocoChecklist[] };

export function estruturarChecklist(item: Item): SecaoChecklist[] {
  const secoes: SecaoChecklist[] = [];
  let atual: SecaoChecklist = { titulo: "", nivel: 2, blocos: [] };
  let nota: string[] = [];
  let pilha: { indent: number; item: ItemChecklist }[] = [];
  let contador = 0;

  const fecharNota = () => {
    const texto = nota.join("\n").trim();
    if (texto) atual.blocos.push({ tipo: "nota", html: renderizar(texto, item.arquivo).html });
    nota = [];
  };
  const blocoItens = () => {
    const ultimo = atual.blocos[atual.blocos.length - 1];
    if (ultimo?.tipo === "itens") return ultimo;
    const novo: BlocoChecklist = { tipo: "itens", itens: [] };
    atual.blocos.push(novo);
    return novo;
  };

  for (const linha of item.corpo.split("\n")) {
    const titulo = linha.match(/^(#{2,4})\s+(.*)$/);
    const marcado = linha.match(/^(\s*)- \[[ xX]\]\s+(.*)$/);
    if (titulo) {
      fecharNota();
      pilha = [];
      if (atual.titulo || atual.blocos.length) secoes.push(atual);
      atual = { titulo: renderizarInline(titulo[2], item.arquivo), nivel: titulo[1].length, blocos: [] };
    } else if (marcado) {
      fecharNota();
      const indent = marcado[1].length;
      const novo: ItemChecklist = {
        chave: `i${contador++}`,
        html: renderizarInline(marcado[2], item.arquivo),
        filhos: [],
      };
      while (pilha.length && pilha[pilha.length - 1].indent >= indent) pilha.pop();
      if (pilha.length) pilha[pilha.length - 1].item.filhos.push(novo);
      else blocoItens().itens.push(novo);
      pilha.push({ indent, item: novo });
    } else if (/^\s+\S/.test(linha) && pilha.length && !nota.length) {
      // continuação do texto do item anterior
      const ultimo = pilha[pilha.length - 1].item;
      ultimo.html += " " + renderizarInline(linha.trim(), item.arquivo);
    } else {
      if (linha.trim()) pilha = [];
      nota.push(linha);
    }
  }
  fecharNota();
  if (atual.titulo || atual.blocos.length) secoes.push(atual);
  return secoes;
}

// ---------- Revisão ----------

export function revisaoDoPilar(pilar: string): string | null {
  const arquivo = path.join(RAIZ, pilar, "REVISAO.md");
  if (!fs.existsSync(arquivo)) return null;
  return fs.readFileSync(arquivo, "utf8");
}

export function caminhoRevisao(pilar: string): string {
  return path.join(RAIZ, pilar, "REVISAO.md");
}

// ---------- Busca ----------

export function textoPlano(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`|]/g, " ")
    .replace(/- \[ \]/g, " ")
    .replace(/-{3,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function textoDoFluxo(f: Fluxo): string {
  const partes: string[] = [];
  for (const p of Object.values(f.perguntas)) {
    partes.push(p.texto, p.ajuda ?? "", ...p.opcoes.map((o) => o.rotulo));
  }
  for (const r of Object.values(f.resultados)) partes.push(r.titulo, r.texto);
  return partes.join(" ");
}

"use client";

import MiniSearch from "minisearch";
import type { Tipo } from "./pilares";

export type DocBusca = {
  id: string;
  titulo: string;
  pilar: string;
  tipo: Tipo;
  resumo: string;
  tags: string;
  baseLegal: string;
  texto: string;
};

export type ResultadoBusca = Pick<DocBusca, "id" | "titulo" | "pilar" | "tipo" | "resumo"> & {
  score: number;
};

const PALAVRAS_VAZIAS = new Set(
  "a o as os de da do das dos e em no na nos nas um uma para por com que se ao aos como ou mais".split(" "),
);

export function normalizar(t: string): string {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

let promessa: Promise<MiniSearch<DocBusca>> | null = null;

export function carregarIndice(): Promise<MiniSearch<DocBusca>> {
  if (!promessa) {
    promessa = fetch("/indice-busca.json")
      .then((r) => r.json() as Promise<DocBusca[]>)
      .then((docs) => {
        const ms = new MiniSearch<DocBusca>({
          fields: ["titulo", "tags", "resumo", "baseLegal", "texto"],
          storeFields: ["id", "titulo", "pilar", "tipo", "resumo"],
          processTerm: (termo) => {
            const t = normalizar(termo);
            return PALAVRAS_VAZIAS.has(t) ? null : t;
          },
          searchOptions: {
            boost: { titulo: 5, tags: 3, resumo: 2, baseLegal: 2, texto: 1 },
            prefix: true,
            fuzzy: (termo) => (termo.length > 5 ? 0.2 : false),
            combineWith: "AND",
          },
        });
        ms.addAll(docs);
        return ms;
      })
      .catch((e) => {
        promessa = null;
        throw e;
      });
  }
  return promessa;
}

export function buscar(ms: MiniSearch<DocBusca>, consulta: string, limite = 30): ResultadoBusca[] {
  const q = consulta.trim();
  if (!q) return [];
  let res = ms.search(q);
  // Se nenhum item tem todos os termos, mostra os que têm algum deles.
  if (!res.length) res = ms.search(q, { combineWith: "OR" });
  return res.slice(0, limite).map((r) => ({
    id: r.id as string,
    titulo: r.titulo as string,
    pilar: r.pilar as string,
    tipo: r.tipo as Tipo,
    resumo: r.resumo as string,
    score: r.score,
  }));
}

"use client";

import { useEffect, useState } from "react";
import type { ItemCatalogo } from "./conteudo";

let promessa: Promise<ItemCatalogo[]> | null = null;
let dados: ItemCatalogo[] | null = null;

export function useCatalogo(): ItemCatalogo[] | null {
  const [lista, setLista] = useState<ItemCatalogo[] | null>(dados);
  useEffect(() => {
    if (dados) return;
    if (!promessa) {
      promessa = fetch("/catalogo.json")
        .then((r) => r.json() as Promise<ItemCatalogo[]>)
        .then((d) => (dados = d))
        .catch((e) => {
          promessa = null;
          throw e;
        });
    }
    promessa.then(setLista).catch(() => {});
  }, []);
  return lista;
}

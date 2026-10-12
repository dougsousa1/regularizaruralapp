"use client";

import { createContext, useContext } from "react";

export type PilarCliente = { slug: string; nome: string; icone: string; descricao: string };

const Contexto = createContext<PilarCliente[]>([]);

/** Pilares atuais (incluindo os criados no painel), disponíveis para os componentes do navegador. */
export default function ProvedorPilares({ pilares, children }: { pilares: PilarCliente[]; children: React.ReactNode }) {
  return <Contexto.Provider value={pilares}>{children}</Contexto.Provider>;
}

export function usePilares() {
  return useContext(Contexto);
}

export function NomePilar({ slug }: { slug: string }) {
  const p = usePilares().find((x) => x.slug === slug);
  return <>{p?.nome ?? ""}</>;
}

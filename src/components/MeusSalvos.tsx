"use client";

import { useState } from "react";
import type { ItemCatalogo } from "@/lib/conteudo";
import { useCatalogo } from "@/lib/catalogo-cliente";
import { useConcluidos, useFavoritos, useMontado, useRecentes } from "@/lib/estado";
import AnelProgresso from "./AnelProgresso";
import { CartaoItem } from "./Cartoes";
import Icone from "./Icone";

type Aba = "salvos" | "recentes" | "concluidos";

export default function MeusSalvos({ totalEstudo }: { totalEstudo: number }) {
  const catalogo = useCatalogo();
  const montado = useMontado();
  const { lista: favoritos } = useFavoritos();
  const { lista: concluidos } = useConcluidos();
  const recentes = useRecentes();
  const [aba, setAba] = useState<Aba>("salvos");

  const porId = new Map((catalogo ?? []).map((c) => [c.id, c]));
  const resolver = (ids: string[]) => ids.map((id) => porId.get(id)).filter((i): i is ItemCatalogo => !!i);
  const listas: Record<Aba, ItemCatalogo[]> = {
    salvos: resolver(montado ? favoritos : []),
    recentes: resolver(montado ? recentes : []),
    concluidos: resolver(montado ? concluidos : []),
  };
  const abas: { id: Aba; rotulo: string; icone: string; vazio: string }[] = [
    { id: "salvos", rotulo: "Salvos", icone: "salvo", vazio: "Toque em “Salvar” em qualquer conteúdo para guardá-lo aqui." },
    { id: "recentes", rotulo: "Recentes", icone: "relogio", vazio: "Os conteúdos que você abrir aparecem aqui." },
    { id: "concluidos", rotulo: "Concluídos", icone: "check", vazio: "Marque guias e tabelas como concluídos para acompanhar seu progresso." },
  ];
  const atual = abas.find((a) => a.id === aba)!;

  return (
    <div className="mt-8">
      <div className="vidro flex items-center gap-5 p-5 sm:p-6">
        <AnelProgresso total={totalEstudo} tamanho={72} />
        <div>
          <p className="titulo-display text-lg">Seu progresso de estudo</p>
          <p className="mt-1 text-sm text-white/50">
            {montado ? concluidos.length : 0} de {totalEstudo} guias e tabelas concluídos ·{" "}
            {montado ? favoritos.length : 0} salvos
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1 sm:inline-flex">
        {abas.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition sm:flex-none ${
              aba === a.id ? "bg-white text-noite-950" : "text-white/55 hover:text-white"
            }`}
          >
            <Icone nome={a.icone} className="h-4 w-4" />
            {a.rotulo}
            <span className={aba === a.id ? "text-noite-950/50" : "text-white/30"}>{listas[a.id].length}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {!catalogo ? (
          <div className="grid gap-3 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/[0.03]" />
            ))}
          </div>
        ) : listas[aba].length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {listas[aba].map((i) => (
              <CartaoItem key={i.id} item={i} mostrarPilar />
            ))}
          </div>
        ) : (
          <div className="vidro grid place-items-center px-6 py-14 text-center">
            <span className="icone-caixa h-12 w-12">
              <Icone nome={atual.icone} className="h-6 w-6" />
            </span>
            <p className="mt-4 max-w-sm text-sm text-white/50">{atual.vazio}</p>
          </div>
        )}
      </div>
      <p className="mt-6 text-center text-xs text-white/30">Seus salvos e progresso ficam guardados neste aparelho.</p>
    </div>
  );
}

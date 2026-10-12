"use client";

import Link from "next/link";
import { useState } from "react";
import { useConcluidos, useFavoritos, useMontado } from "@/lib/estado";
import { rotaDoItem, TIPOS, type Tipo } from "@/lib/pilares";
import { IconeTipo } from "./Cartoes";
import Icone from "./Icone";

type Linha = { id: string; titulo: string; tipo: Tipo; resumo: string };

export default function ListaPilar({ grupos }: { grupos: { tipo: Tipo; itens: Linha[] }[] }) {
  const [aba, setAba] = useState<Tipo | "todos">("todos");
  const { tem: concluido } = useConcluidos();
  const { tem: favorito } = useFavoritos();
  const montado = useMontado();
  const visiveis = grupos.filter((g) => aba === "todos" || g.tipo === aba);

  return (
    <div>
      <div className="sem-barra -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
          {[{ tipo: "todos" as const, n: grupos.reduce((s, g) => s + g.itens.length, 0) }, ...grupos.map((g) => ({ tipo: g.tipo, n: g.itens.length }))].map(
            (t) => (
              <button
                key={t.tipo}
                onClick={() => setAba(t.tipo)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  aba === t.tipo ? "bg-white text-noite-950 shadow" : "text-white/55 hover:text-white"
                }`}
              >
                {t.tipo === "todos" ? "Tudo" : TIPOS[t.tipo].plural}
                <span className={`ml-1.5 text-xs ${aba === t.tipo ? "text-noite-950/50" : "text-white/30"}`}>{t.n}</span>
              </button>
            ),
          )}
        </div>
      </div>

      <div className="mt-6 space-y-8">
        {visiveis.map((g) => (
          <section key={g.tipo}>
            {aba === "todos" && (
              <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                {TIPOS[g.tipo].plural}
                <span className="h-px flex-1 bg-white/[0.06]" />
              </h2>
            )}
            <ul className="vidro divide-y divide-white/[0.06] overflow-hidden">
              {g.itens.map((i, n) => {
                const feito = montado && concluido(i.id);
                return (
                  <li key={i.id}>
                    <Link
                      href={rotaDoItem(i.tipo, i.id)}
                      className="group flex items-center gap-4 px-4 py-3.5 transition hover:bg-white/[0.04] sm:px-5"
                    >
                      <span className="hidden w-6 text-right text-xs font-semibold tabular-nums text-white/25 sm:block">
                        {String(n + 1).padStart(2, "0")}
                      </span>
                      <IconeTipo tipo={i.tipo} tamanho="h-9 w-9" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className={`font-semibold leading-snug ${feito ? "text-white/60" : "text-white"} group-hover:text-ouro-100`}>
                            {i.titulo}
                          </span>
                          {montado && favorito(i.id) && <Icone nome="salvo" cheio className="h-3.5 w-3.5 shrink-0 text-ouro-300" />}
                        </span>
                        <span className="mt-0.5 line-clamp-1 block text-[13px] text-white/40">{i.resumo}</span>
                      </span>
                      {feito ? (
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mata-500 text-white">
                          <Icone nome="check" className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <Icone nome="seta" className="h-4 w-4 shrink-0 text-white/20 transition group-hover:text-ouro-300" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

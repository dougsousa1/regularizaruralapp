"use client";

import Link from "next/link";
import type { ItemCatalogo } from "@/lib/conteudo";
import { useCatalogo } from "@/lib/catalogo-cliente";
import { lerMarcadosDe, useConcluidos, useFavoritos, useMontado, useRecentes, useVersaoEstado } from "@/lib/estado";
import { getPilar, rotaDoItem, TIPOS } from "@/lib/pilares";
import { IconeTipo } from "./Cartoes";
import Icone from "./Icone";
import { abrirBusca } from "./PaletaBusca";

export function BuscaHero({ atalhos }: { atalhos: string[] }) {
  return (
    <div>
      <button
        onClick={() => abrirBusca()}
        className="group flex h-14 w-full items-center gap-3 rounded-2xl border border-white/10 bg-noite-950/60 px-5 text-left text-white/45 shadow-2xl shadow-black/40 backdrop-blur-xl transition hover:border-ouro-400/40"
      >
        <Icone nome="busca" className="h-5 w-5 text-ouro-300" />
        <span className="flex-1 truncate text-[15px]">Qual é o caso do seu cliente?</span>
        <kbd className="hidden rounded-lg border border-white/10 px-2 py-1 text-[11px] font-medium text-white/35 sm:block">
          Ctrl K
        </kbd>
      </button>
      <div className="sem-barra -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
        {atalhos.map((a) => (
          <button
            key={a}
            onClick={() => abrirBusca(a)}
            className="shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white/65 backdrop-blur transition hover:border-ouro-400/40 hover:text-white"
          >
            {a}
          </button>
        ))}
      </div>
    </div>
  );
}

function CartaoRecente({ item }: { item: ItemCatalogo }) {
  return (
    <Link
      href={rotaDoItem(item.tipo, item.id)}
      className="vidro-interativo group flex w-[260px] shrink-0 flex-col p-4 sm:w-[280px]"
    >
      <div className="flex items-center gap-3">
        <IconeTipo tipo={item.tipo} tamanho="h-9 w-9" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-white/35">
          {TIPOS[item.tipo].nome}
          <span className="block normal-case tracking-normal text-white/30">{getPilar(item.pilar)?.nome}</span>
        </span>
      </div>
      <p className="mt-3 line-clamp-2 font-semibold leading-snug text-white group-hover:text-ouro-100">{item.titulo}</p>
      <span className="mt-auto flex items-center gap-1 pt-4 text-xs font-semibold text-ouro-300">
        Continuar <Icone nome="seta" className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function PainelAluno({ sugestoes }: { sugestoes: ItemCatalogo[] }) {
  const catalogo = useCatalogo();
  const montado = useMontado();
  const recentes = useRecentes();
  const { lista: favoritos } = useFavoritos();
  useVersaoEstado();

  if (!montado || !catalogo) {
    return <div className="h-40 animate-pulse rounded-2xl bg-white/[0.03]" />;
  }
  const porId = new Map(catalogo.map((c) => [c.id, c]));
  const vistos = recentes.map((id) => porId.get(id)).filter((i): i is ItemCatalogo => !!i);
  const emAndamento = catalogo
    .filter((c) => c.tipo === "checklist" && c.total)
    .map((c) => ({ ...c, feitos: lerMarcadosDe(c.id) }))
    .filter((c) => c.feitos > 0 && c.feitos < (c.total ?? 0));
  const nFav = favoritos.filter((id) => porId.has(id)).length;

  const lista = vistos.length ? vistos.slice(0, 10) : sugestoes;

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="rotulo mb-1.5">{vistos.length ? "Seu histórico" : "Primeiros passos"}</p>
            <h2 className="titulo-display text-xl sm:text-2xl">
              {vistos.length ? "Continue de onde parou" : "Comece por aqui"}
            </h2>
          </div>
          {nFav > 0 && (
            <Link href="/salvos" className="shrink-0 text-sm font-semibold text-ouro-300 hover:text-ouro-200">
              {nFav} salvo{nFav > 1 ? "s" : ""} →
            </Link>
          )}
        </div>
        <div className="sem-barra -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          {lista.map((i) => (
            <div key={i.id} className="snap-start">
              <CartaoRecente item={i} />
            </div>
          ))}
        </div>
      </section>

      {emAndamento.length > 0 && (
        <section>
          <p className="rotulo mb-1.5">Atendimentos em curso</p>
          <h2 className="titulo-display mb-4 text-xl sm:text-2xl">Checklists em andamento</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {emAndamento.slice(0, 6).map((c) => {
              const pct = Math.round((c.feitos / (c.total ?? 1)) * 100);
              return (
                <Link key={c.id} href={rotaDoItem("checklist", c.id)} className="vidro-interativo group p-4">
                  <div className="flex items-center gap-3">
                    <IconeTipo tipo="checklist" tamanho="h-9 w-9" />
                    <p className="min-w-0 flex-1 truncate font-semibold text-white">{c.titulo.replace(/^Checklist — /, "")}</p>
                    <span className="text-sm font-bold text-ouro-200">{pct}%</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-ouro-300 to-ouro-500" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-white/40">
                    {c.feitos} de {c.total} itens
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export function ProgressoPilar({ ids }: { ids: string[] }) {
  const { lista } = useConcluidos();
  const montado = useMontado();
  const feitos = montado ? ids.filter((id) => lista.includes(id)).length : 0;
  const pct = ids.length ? Math.round((feitos / ids.length) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-[11px] font-medium text-white/40">
        <span>{feitos ? `${feitos} de ${ids.length} concluídos` : `${ids.length} para estudar`}</span>
        <span className="text-ouro-200">{pct}%</span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-ouro-300 to-ouro-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

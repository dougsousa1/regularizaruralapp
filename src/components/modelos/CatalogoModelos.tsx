"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TIPOS_DOCUMENTO, type ModeloResumo } from "@/lib/modelos-tipos";
import Icone from "../Icone";

type PilarSimples = { slug: string; nome: string; icone: string };

function normalizar(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function CartaoModelo({ m }: { m: ModeloResumo }) {
  return (
    <Link href={`/modelos/${m.id}`} className="vidro-interativo group flex gap-4 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-200">
        <Icone nome="contrato" className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold leading-snug text-white transition group-hover:text-ouro-100">{m.titulo}</span>
        <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-wider text-white/35">
          {TIPOS_DOCUMENTO[m.tipo]?.nome ?? "Documento"} · {m.nCampos} campos
        </span>
        <span className="mt-1.5 line-clamp-2 block text-sm leading-relaxed text-white/50">{m.resumo}</span>
      </span>
      <Icone
        nome="seta"
        className="mt-1 h-4 w-4 shrink-0 -translate-x-1 text-white/20 transition group-hover:translate-x-0 group-hover:text-ouro-300"
      />
    </Link>
  );
}

export default function CatalogoModelos({ modelos, pilares }: { modelos: ModeloResumo[]; pilares: PilarSimples[] }) {
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState<string | null>(null);

  const tipos = useMemo(() => {
    const cont = new Map<string, number>();
    modelos.forEach((m) => cont.set(m.tipo, (cont.get(m.tipo) ?? 0) + 1));
    return [...cont.entries()].sort((a, b) => b[1] - a[1]);
  }, [modelos]);

  const filtrados = useMemo(() => {
    const termos = normalizar(busca).split(/\s+/).filter(Boolean);
    return modelos.filter((m) => {
      if (tipo && m.tipo !== tipo) return false;
      const texto = normalizar(`${m.titulo} ${m.resumo} ${TIPOS_DOCUMENTO[m.tipo]?.nome ?? ""}`);
      return termos.every((t) => texto.includes(t));
    });
  }, [modelos, busca, tipo]);

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex flex-1 items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 focus-within:border-ouro-400/40">
          <Icone nome="busca" className="h-4 w-4 text-white/40" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar modelo: arrendamento, usucapião, ITR…"
            className="h-11 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </label>
      </div>
      <div className="sem-barra -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          onClick={() => setTipo(null)}
          className={`chip shrink-0 py-1.5 transition ${!tipo ? "border-ouro-400/50 bg-ouro-400/15 text-white" : "hover:text-white"}`}
        >
          Todos <span className="text-white/30">{modelos.length}</span>
        </button>
        {tipos.map(([t, n]) => (
          <button
            key={t}
            onClick={() => setTipo(tipo === t ? null : t)}
            className={`chip shrink-0 py-1.5 transition ${tipo === t ? "border-ouro-400/50 bg-ouro-400/15 text-white" : "hover:text-white"}`}
          >
            {TIPOS_DOCUMENTO[t]?.plural ?? t} <span className="text-white/30">{n}</span>
          </button>
        ))}
      </div>

      {!filtrados.length && <p className="mt-10 text-sm text-white/50">Nenhum modelo encontrado. Tente outras palavras.</p>}

      {pilares.map((p) => {
        const itens = filtrados.filter((m) => m.pilar === p.slug);
        if (!itens.length) return null;
        return (
          <section key={p.slug} className="mt-10">
            <h2 className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
              <Icone nome={p.icone} className="h-4 w-4 text-ouro-400" />
              {p.nome}
              <span className="text-white/25">{itens.length}</span>
              <span className="h-px flex-1 bg-white/[0.06]" />
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {itens.map((m) => (
                <CartaoModelo key={m.id} m={m} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

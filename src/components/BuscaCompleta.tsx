"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type MiniSearch from "minisearch";
import { buscar, carregarIndice, type DocBusca } from "@/lib/busca";
import { PILARES, TIPOS, type Tipo } from "@/lib/pilares";
import { CartaoItem } from "./Cartoes";
import Icone from "./Icone";

export default function BuscaCompleta() {
  const params = useSearchParams();
  const router = useRouter();
  const inicial = params.get("q") ?? "";
  const [consulta, setConsulta] = useState(inicial);
  const [indice, setIndice] = useState<MiniSearch<DocBusca> | null>(null);
  const [pilar, setPilar] = useState("");
  const [tipo, setTipo] = useState<Tipo | "">("");

  useEffect(() => setConsulta(inicial), [inicial]);
  useEffect(() => {
    carregarIndice().then(setIndice).catch(() => {});
  }, []);

  const todos = indice ? buscar(indice, consulta, 200) : [];
  const resultados = todos.filter((r) => (!pilar || r.pilar === pilar) && (!tipo || r.tipo === tipo));

  return (
    <div className="mt-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.replace(`/buscar?q=${encodeURIComponent(consulta)}`);
        }}
        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 backdrop-blur transition focus-within:border-ouro-400/50"
      >
        <Icone nome="busca" className="h-5 w-5 text-ouro-300" />
        <input
          autoFocus
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Busque um tema, lei ou situação"
          className="h-14 w-full bg-transparent text-white outline-none placeholder:text-white/30 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </form>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <select
          value={pilar}
          onChange={(e) => setPilar(e.target.value)}
          className="rounded-full border border-white/10 bg-noite-800 px-4 py-2 text-white/80"
          aria-label="Filtrar por pilar"
        >
          <option value="">Todos os pilares</option>
          {PILARES.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.nome}
            </option>
          ))}
        </select>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as Tipo | "")}
          className="rounded-full border border-white/10 bg-noite-800 px-4 py-2 text-white/80"
          aria-label="Filtrar por tipo"
        >
          <option value="">Todos os tipos</option>
          {(Object.keys(TIPOS) as Tipo[]).map((t) => (
            <option key={t} value={t}>
              {TIPOS[t].plural}
            </option>
          ))}
        </select>
      </div>

      {!indice && <p className="mt-8 text-white/45">Carregando a base…</p>}
      {indice && consulta.trim() && (
        <p className="mt-6 text-sm text-white/45">
          {resultados.length} resultado{resultados.length === 1 ? "" : "s"} para “{consulta}”
        </p>
      )}
      {indice && consulta.trim() && !resultados.length && (
        <p className="mt-4 text-white/55">
          Nada encontrado. Tente sinônimos (ex.: “arrendamento” em vez de “aluguel de terra”) ou menos palavras.
        </p>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {resultados.map((r) => (
          <CartaoItem key={r.id} item={r} mostrarPilar />
        ))}
      </div>
    </div>
  );
}

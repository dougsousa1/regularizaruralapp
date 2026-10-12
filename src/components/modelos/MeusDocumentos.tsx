"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseNavegador } from "@/lib/supabase/cliente";
import Icone from "../Icone";

type Rascunho = { id: string; modelo_id: string; titulo: string; atualizado_em: string };

function quando(iso: string) {
  const d = new Date(iso);
  const dias = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (dias < 1) return `hoje, ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  if (dias < 2) return "ontem";
  return d.toLocaleDateString("pt-BR");
}

export default function MeusDocumentos({ titulos }: { titulos: Record<string, string> }) {
  const [lista, setLista] = useState<Rascunho[] | null>(null);
  const [todos, setTodos] = useState(false);

  useEffect(() => {
    supabaseNavegador()
      .from("documentos")
      .select("id, modelo_id, titulo, atualizado_em")
      .order("atualizado_em", { ascending: false })
      .limit(50)
      .then(({ data }) => setLista((data as Rascunho[]) ?? []));
  }, []);

  const excluir = async (r: Rascunho) => {
    if (!confirm(`Excluir “${r.titulo}”? Essa ação não pode ser desfeita.`)) return;
    const { error } = await supabaseNavegador().from("documentos").delete().eq("id", r.id);
    if (!error) setLista((l) => l?.filter((x) => x.id !== r.id) ?? null);
  };

  if (!lista?.length) return null;
  const visiveis = todos ? lista : lista.slice(0, 6);

  return (
    <section className="mt-8">
      <h2 className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
        <Icone nome="relogio" className="h-4 w-4 text-ouro-400" />
        Meus documentos
        <span className="text-white/25">{lista.length}</span>
        <span className="h-px flex-1 bg-white/[0.06]" />
      </h2>
      <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {visiveis.map((r) => (
          <li key={r.id} className="vidro-interativo group flex items-center gap-3 p-3">
            <Link href={`/modelos/${r.modelo_id}?doc=${r.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-stone-700 shadow">
                <Icone nome="contrato" className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">{r.titulo}</span>
                <span className="block truncate text-[11px] text-white/40">
                  {titulos[r.modelo_id] ?? "Modelo"} · {quando(r.atualizado_em)}
                </span>
              </span>
            </Link>
            <button
              onClick={() => excluir(r)}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/25 opacity-0 transition hover:bg-white/[0.06] hover:text-red-300 group-hover:opacity-100 max-lg:opacity-100"
              aria-label="Excluir documento"
            >
              <Icone nome="fechar" className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
      {lista.length > 6 && (
        <button onClick={() => setTodos(!todos)} className="mt-3 text-sm font-semibold text-ouro-300 hover:text-ouro-200">
          {todos ? "Mostrar menos" : `Ver todos (${lista.length})`}
        </button>
      )}
    </section>
  );
}

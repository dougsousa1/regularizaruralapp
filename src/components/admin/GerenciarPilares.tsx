"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { excluirPilar, ordenarPilares, salvarPilar, type DadosPilar } from "@/app/(app)/admin/conteudos/acoes";
import { ICONES_PILAR } from "@/lib/pilares";
import Icone from "../Icone";

type PilarAdmin = { slug: string; nome: string; descricao: string; icone: string; comeceAqui: string; total: number; guias: { id: string; titulo: string }[] };

const entrada =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-ouro-400/50 focus-visible:ring-0 focus-visible:ring-offset-0";

function Formulario({ inicial, guias, aoFechar }: { inicial: DadosPilar; guias: { id: string; titulo: string }[]; aoFechar: () => void }) {
  const router = useRouter();
  const [d, setD] = useState(inicial);
  const [erro, setErro] = useState("");
  const [pendente, iniciar] = useTransition();
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-noite-950/70 p-3 backdrop-blur-md sm:items-center" onMouseDown={(e) => e.target === e.currentTarget && aoFechar()}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          iniciar(async () => {
            const r = await salvarPilar(d);
            if (!r.ok) return setErro(r.mensagem);
            aoFechar();
            router.refresh();
          });
        }}
        className="w-full max-w-lg space-y-4 rounded-3xl border border-white/10 bg-noite-850 p-6 shadow-2xl animate-surgir"
      >
        <h2 className="font-display text-xl font-bold text-white">{inicial.slug ? "Editar pilar" : "Novo pilar"}</h2>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-white/65">Nome</span>
          <input autoFocus value={d.nome} onChange={(e) => setD({ ...d, nome: e.target.value })} placeholder="Ex.: Sucessão Rural" className={entrada} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-white/65">Descrição</span>
          <textarea value={d.descricao} onChange={(e) => setD({ ...d, descricao: e.target.value })} rows={2} placeholder="Do que trata este pilar (aparece no cartão)" className={entrada} />
        </label>
        <div>
          <span className="mb-1.5 block text-xs font-semibold text-white/65">Ícone</span>
          <div className="flex flex-wrap gap-2">
            {ICONES_PILAR.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setD({ ...d, icone: i })}
                className={`grid h-10 w-10 place-items-center rounded-xl border transition ${d.icone === i ? "border-ouro-400/60 bg-ouro-400/15 text-ouro-200" : "border-white/10 text-white/50 hover:text-white"}`}
                aria-label={i}
              >
                <Icone nome={i} className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
        {inicial.slug && (
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-white/65">Guia “Comece por aqui”</span>
            <select value={d.comeceAqui} onChange={(e) => setD({ ...d, comeceAqui: e.target.value })} className={entrada}>
              <option value="">Nenhum</option>
              {guias.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.titulo}
                </option>
              ))}
            </select>
          </label>
        )}
        {erro && <p className="text-sm text-red-300">{erro}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={aoFechar} className="botao-fantasma">
            Cancelar
          </button>
          <button disabled={pendente} className="botao-ouro disabled:opacity-60">
            {pendente ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function GerenciarPilares({ pilares }: { pilares: PilarAdmin[] }) {
  const router = useRouter();
  const [editando, setEditando] = useState<PilarAdmin | "novo" | null>(null);
  const [msg, setMsg] = useState("");
  const [pendente, iniciar] = useTransition();

  const mover = (n: number, d: -1 | 1) => {
    const slugs = pilares.map((p) => p.slug);
    [slugs[n], slugs[n + d]] = [slugs[n + d], slugs[n]];
    iniciar(async () => {
      const r = await ordenarPilares(slugs);
      setMsg(r.ok ? "" : r.mensagem);
      router.refresh();
    });
  };

  const excluir = (p: PilarAdmin) => {
    if (!confirm(`Excluir o pilar “${p.nome}”?`)) return;
    iniciar(async () => {
      const r = await excluirPilar(p.slug);
      setMsg(r.ok ? "" : r.mensagem);
      router.refresh();
    });
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-3">
        {msg ? <p className="text-sm text-red-300">{msg}</p> : <span />}
        <button onClick={() => setEditando("novo")} className="botao-ouro">
          <Icone nome="mais" className="h-4 w-4" />
          Novo pilar
        </button>
      </div>
      <ul className={`mt-4 space-y-2 ${pendente ? "opacity-60" : ""}`}>
        {pilares.map((p, n) => (
          <li key={p.slug} className="vidro flex items-center gap-3 p-3 sm:p-4">
            <div className="flex flex-col">
              <button disabled={n === 0 || pendente} onClick={() => mover(n, -1)} className="px-1 text-white/40 hover:text-white disabled:opacity-20" aria-label="Subir">
                ▲
              </button>
              <button disabled={n === pilares.length - 1 || pendente} onClick={() => mover(n, 1)} className="px-1 text-white/40 hover:text-white disabled:opacity-20" aria-label="Descer">
                ▼
              </button>
            </div>
            <span className="icone-caixa h-11 w-11">
              <Icone nome={p.icone} className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-white">{p.nome}</span>
              <span className="block truncate text-xs text-white/40">
                {p.total} conteúdos{p.descricao ? ` · ${p.descricao}` : ""}
              </span>
            </span>
            <div className="flex shrink-0 flex-wrap justify-end gap-1">
              <Link href={`/admin/conteudos/novo?pilar=${p.slug}`} className="hidden rounded-full px-3 py-1.5 text-xs font-semibold text-white/55 hover:bg-white/[0.06] hover:text-white sm:inline">
                + Conteúdo
              </Link>
              <button onClick={() => setEditando(p)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-ouro-300 hover:bg-white/[0.06]">
                Editar
              </button>
              {p.total === 0 && (
                <button onClick={() => excluir(p)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-red-300/80 hover:bg-red-500/10">
                  Excluir
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {editando && (
        <Formulario
          inicial={
            editando === "novo"
              ? { nome: "", descricao: "", icone: "estrela", comeceAqui: "" }
              : { slug: editando.slug, nome: editando.nome, descricao: editando.descricao, icone: editando.icone, comeceAqui: editando.comeceAqui }
          }
          guias={editando === "novo" ? [] : editando.guias}
          aoFechar={() => setEditando(null)}
        />
      )}
    </div>
  );
}

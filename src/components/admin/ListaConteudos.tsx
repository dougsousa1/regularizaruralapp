"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { reativarConteudo } from "@/app/(app)/admin/conteudos/acoes";
import { TIPOS, type Tipo } from "@/lib/pilares";
import { IconeTipo } from "../Cartoes";
import Icone from "../Icone";

type Linha = { id: string; titulo: string; tipo: Tipo; pilar: string; revisao: string; origem: string; atualizadoEm: string | null };
type Excluido = { id: string; titulo: string; tipo: string; pilar: string; atualizado_em: string };

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function ListaConteudos({ itens, pilares, excluidos }: { itens: Linha[]; pilares: { slug: string; nome: string }[]; excluidos: Excluido[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [pilar, setPilar] = useState("");
  const [tipo, setTipo] = useState("");
  const [situacao, setSituacao] = useState("");
  const [pendente, iniciar] = useTransition();

  const filtrados = useMemo(
    () =>
      itens.filter(
        (i) =>
          (!pilar || i.pilar === pilar) &&
          (!tipo || i.tipo === tipo) &&
          (!situacao || (situacao === "editado" ? i.origem !== "arquivo" : situacao === "revisado" ? i.revisao === "revisado" : i.revisao !== "revisado")) &&
          norm(i.titulo).includes(norm(busca.trim())),
      ),
    [itens, busca, pilar, tipo, situacao],
  );
  const nomePilar = new Map(pilares.map((p) => [p.slug, p.nome]));
  const select = "rounded-full border border-white/10 bg-noite-800 px-4 py-2 text-sm text-white/80";

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-2 lg:flex-row">
        <label className="flex flex-1 items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 focus-within:border-ouro-400/40">
          <Icone nome="busca" className="h-4 w-4 text-white/40" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar pelo título…"
            className="h-10 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <select value={pilar} onChange={(e) => setPilar(e.target.value)} className={select} aria-label="Pilar">
            <option value="">Todos os pilares</option>
            {pilares.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.nome}
              </option>
            ))}
          </select>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={select} aria-label="Tipo">
            <option value="">Todos os tipos</option>
            {(Object.keys(TIPOS) as Tipo[]).map((t) => (
              <option key={t} value={t}>
                {TIPOS[t].plural}
              </option>
            ))}
          </select>
          <select value={situacao} onChange={(e) => setSituacao(e.target.value)} className={select} aria-label="Situação">
            <option value="">Qualquer situação</option>
            <option value="pendente">Aguardando revisão</option>
            <option value="revisado">Revisados</option>
            <option value="editado">Editados ou criados no painel</option>
          </select>
        </div>
      </div>

      <p className="mt-4 text-xs text-white/40">{filtrados.length} conteúdos</p>
      <ul className="mt-2 divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        {filtrados.map((i) => (
          <li key={i.id}>
            <Link href={`/admin/conteudos/${i.id}`} className="group flex items-center gap-3 px-4 py-3 transition hover:bg-white/[0.04]">
              <IconeTipo tipo={i.tipo} tamanho="h-9 w-9" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white/90 group-hover:text-white">{i.titulo}</span>
                <span className="block truncate text-[11px] text-white/40">
                  {TIPOS[i.tipo].nome} · {nomePilar.get(i.pilar)}
                  {i.atualizadoEm && ` · editado em ${new Date(i.atualizadoEm).toLocaleDateString("pt-BR")}`}
                </span>
              </span>
              {i.origem !== "arquivo" && (
                <span className="hidden rounded-full bg-sky-400/10 px-2 py-0.5 text-[10px] font-semibold text-sky-200 sm:inline">
                  {i.origem === "novo" ? "Novo" : "Editado"}
                </span>
              )}
              <span
                className={`hidden rounded-full px-2 py-0.5 text-[10px] font-semibold sm:inline ${i.revisao === "revisado" ? "bg-mata-500/20 text-mata-200" : "bg-ouro-400/15 text-ouro-200"}`}
              >
                {i.revisao === "revisado" ? "Revisado" : "Pendente"}
              </span>
              <Icone nome="seta" className="h-4 w-4 shrink-0 text-white/20 group-hover:text-ouro-300" />
            </Link>
          </li>
        ))}
      </ul>

      {excluidos.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm font-semibold text-white/50">Excluídos ({excluidos.length})</summary>
          <ul className="mt-3 space-y-2">
            {excluidos.map((e) => (
              <li key={e.id} className="vidro flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="min-w-0 truncate text-white/60">{e.titulo}</span>
                <button
                  disabled={pendente}
                  onClick={() => iniciar(async () => {
                    await reativarConteudo(e.id);
                    router.refresh();
                  })}
                  className="shrink-0 text-xs font-semibold text-ouro-300 hover:text-ouro-200"
                >
                  Desfazer exclusão
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

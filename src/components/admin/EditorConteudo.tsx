"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  excluirConteudo,
  restaurarOriginal,
  restaurarVersao,
  salvarConteudo,
  type DadosConteudo,
} from "@/app/(app)/admin/conteudos/acoes";
import { rotaDoItem, TIPOS, type Tipo } from "@/lib/pilares";
import Icone from "../Icone";
import EditorTexto from "./EditorTexto";

export type OpcaoItem = { id: string; titulo: string; tipo: Tipo; pilar: string };
export type Versao = { id: number; criado_em: string; titulo: string };

type Props = {
  inicial: DadosConteudo & { origem?: "arquivo" | "editado" | "novo" };
  pilares: { slug: string; nome: string }[];
  opcoes: OpcaoItem[];
  versoes: Versao[];
};

const entrada =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-ouro-400/50 focus-visible:ring-0 focus-visible:ring-offset-0";

function Campo({ rotulo, dica, children }: { rotulo: string; dica?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-white/65">{rotulo}</span>
      {children}
      {dica && <span className="mt-1 block text-[11px] text-white/35">{dica}</span>}
    </label>
  );
}

function SeletorRelacionados({ valor, opcoes, aoMudar, proprio }: { valor: string[]; opcoes: OpcaoItem[]; aoMudar: (v: string[]) => void; proprio?: string }) {
  const [busca, setBusca] = useState("");
  const porId = useMemo(() => new Map(opcoes.map((o) => [o.id, o])), [opcoes]);
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const sugestoes = busca.trim()
    ? opcoes.filter((o) => o.id !== proprio && !valor.includes(o.id) && norm(o.titulo).includes(norm(busca))).slice(0, 8)
    : [];
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {valor.map((id) => (
          <span key={id} className="chip gap-1 pr-1.5">
            {porId.get(id)?.titulo ?? id}
            <button type="button" onClick={() => aoMudar(valor.filter((v) => v !== id))} className="grid h-4 w-4 place-items-center rounded-full text-white/40 hover:bg-white/10 hover:text-white" aria-label="Remover">
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="relative mt-2">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar conteúdo para relacionar…" className={entrada} />
        {sugestoes.length > 0 && (
          <ul className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-white/10 bg-noite-850 shadow-2xl">
            {sugestoes.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => {
                    aoMudar([...valor, o.id]);
                    setBusca("");
                  }}
                  className="flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left text-sm text-white/80 hover:bg-white/[0.06]"
                >
                  <span className="truncate">{o.titulo}</span>
                  <span className="shrink-0 text-[11px] text-white/35">{TIPOS[o.tipo].nome}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function EditorConteudo({ inicial, pilares, opcoes, versoes }: Props) {
  const router = useRouter();
  const [d, setD] = useState<DadosConteudo>(inicial);
  const [tags, setTags] = useState(inicial.tags.join(", "));
  const [baseLegal, setBaseLegal] = useState(inicial.baseLegal.join("\n"));
  const [alterado, setAlterado] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pendente, iniciar] = useTransition();
  const novo = !inicial.id;
  const fluxo = d.tipo === "fluxo";

  const mudar = (parcial: Partial<DadosConteudo>) => {
    setD((x) => ({ ...x, ...parcial }));
    setAlterado(true);
    setMsg(null);
  };

  useEffect(() => {
    if (!alterado) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [alterado]);

  const executar = (fn: () => Promise<{ ok: boolean; mensagem: string; id?: string }>, depois?: (id?: string) => void) =>
    iniciar(async () => {
      const r = await fn();
      setMsg({ ok: r.ok, texto: r.mensagem });
      if (r.ok) {
        setAlterado(false);
        depois?.(r.id);
        router.refresh();
      }
    });

  const salvar = () =>
    executar(
      () =>
        salvarConteudo({
          ...d,
          tags: tags.split(/[,;\n]/),
          baseLegal: baseLegal.split("\n"),
        }),
      (id) => novo && id && router.replace(`/admin/conteudos/${id}`),
    );

  const urlSite = d.id ? rotaDoItem(d.tipo, d.id) : null;

  return (
    <div className="grid gap-6 pb-24 xl:grid-cols-[minmax(0,1fr)_20rem] xl:pb-10">
      {/* No celular o botão de salvar fica sempre à mão */}
      {(alterado || novo || msg) && (
        <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-40 flex items-center gap-3 border-t border-white/10 bg-noite-900/95 px-5 py-3 backdrop-blur-xl lg:bottom-0 lg:left-72 xl:hidden">
          <p className={`min-w-0 flex-1 truncate text-xs ${msg ? (msg.ok ? "text-mata-300" : "text-red-300") : "text-white/50"}`}>
            {msg ? msg.texto : "Alterações não salvas"}
          </p>
          <button onClick={salvar} disabled={pendente || (!alterado && !novo)} className="botao-ouro shrink-0 disabled:opacity-50">
            {pendente ? "Salvando…" : novo ? "Criar" : "Salvar"}
          </button>
        </div>
      )}
      <div className="min-w-0 space-y-5">
        <textarea
          value={d.titulo}
          onChange={(e) => mudar({ titulo: e.target.value.replace(/\n/g, " ") })}
          placeholder="Título do conteúdo"
          rows={1}
          className="block w-full resize-none bg-transparent font-display text-2xl font-bold leading-tight text-white outline-none [field-sizing:content] placeholder:text-white/25 focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-3xl"
          aria-label="Título"
        />
        <textarea
          value={d.resumo}
          onChange={(e) => mudar({ resumo: e.target.value })}
          placeholder="Resumo (aparece abaixo do título e nos cartões)"
          rows={2}
          className={entrada}
        />
        {fluxo ? (
          <div className="vidro p-6 text-sm text-white/60">
            Este é um <b className="text-white">fluxo de decisão</b>. Por enquanto dá para editar o título, o resumo, o pilar e os
            demais dados ao lado. O editor das perguntas e respostas do fluxo vem na próxima etapa.
          </div>
        ) : (
          <EditorTexto valor={d.corpo} aoMudar={(corpo) => mudar({ corpo })} checklist={d.tipo === "checklist"} />
        )}
      </div>

      <aside className="space-y-4 xl:sticky xl:top-16 xl:self-start">
        <div className="vidro space-y-3 p-4">
          <button onClick={salvar} disabled={pendente || (!alterado && !novo)} className="botao-ouro w-full disabled:opacity-50">
            {pendente ? "Salvando…" : novo ? "Criar e publicar" : alterado ? "Salvar e publicar" : "Tudo salvo"}
          </button>
          {msg && <p className={`text-center text-xs ${msg.ok ? "text-mata-300" : "text-red-300"}`}>{msg.texto}</p>}
          {urlSite && (
            <Link href={urlSite} target="_blank" className="botao-fantasma w-full">
              Ver no site <Icone nome="seta" className="h-3.5 w-3.5" />
            </Link>
          )}
          {inicial.origem && (
            <p className="text-center text-[11px] text-white/35">
              {inicial.origem === "arquivo" ? "Conteúdo original do curso" : inicial.origem === "editado" ? "Conteúdo do curso, editado no painel" : "Criado no painel"}
            </p>
          )}
        </div>

        <div className="vidro space-y-4 p-4">
          <Campo rotulo="Pilar">
            <select value={d.pilar} onChange={(e) => mudar({ pilar: e.target.value })} className={entrada}>
              {pilares.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.nome}
                </option>
              ))}
            </select>
          </Campo>
          <Campo rotulo="Tipo" dica={novo ? undefined : "O tipo não muda depois de criado."}>
            <select value={d.tipo} disabled={!novo} onChange={(e) => mudar({ tipo: e.target.value as Tipo })} className={`${entrada} disabled:opacity-60`}>
              {(novo ? (["guia", "checklist", "referencia"] as Tipo[]) : [d.tipo]).map((t) => (
                <option key={t} value={t}>
                  {TIPOS[t].nome}
                </option>
              ))}
            </select>
          </Campo>
          <Campo rotulo="Situação">
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
              {(["pendente", "revisado"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => mudar({ revisao: r })}
                  className={`rounded-lg py-1.5 text-xs font-semibold ${d.revisao === r ? (r === "revisado" ? "bg-mata-500/30 text-mata-100" : "bg-ouro-400/20 text-ouro-100") : "text-white/45"}`}
                >
                  {r === "revisado" ? "Revisado" : "Aguardando revisão"}
                </button>
              ))}
            </div>
          </Campo>
          <Campo rotulo="Assuntos (tags)" dica="Separe por vírgula. Ajudam na busca.">
            <input
              value={tags}
              onChange={(e) => {
                setTags(e.target.value);
                setAlterado(true);
              }}
              className={entrada}
            />
          </Campo>
          <Campo rotulo="Base legal" dica="Uma referência por linha.">
            <textarea
              value={baseLegal}
              onChange={(e) => {
                setBaseLegal(e.target.value);
                setAlterado(true);
              }}
              rows={3}
              className={entrada}
            />
          </Campo>
          <Campo rotulo="Fonte">
            <input value={d.fonte} onChange={(e) => mudar({ fonte: e.target.value })} placeholder="Ex.: Aula 03 — Pilar Fiscal" className={entrada} />
          </Campo>
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-white/65">Veja também (relacionados)</span>
            <SeletorRelacionados valor={d.relacionados} opcoes={opcoes} proprio={d.id} aoMudar={(relacionados) => mudar({ relacionados })} />
          </div>
        </div>

        {!novo && (
          <div className="vidro space-y-2 p-4">
            {inicial.origem === "editado" && (
              <button
                type="button"
                disabled={pendente}
                onClick={() => confirm("Voltar ao texto original do curso? As edições ficam guardadas no histórico.") && executar(() => restaurarOriginal(d.id!), () => location.reload())}
                className="botao-fantasma w-full text-xs"
              >
                Restaurar texto original
              </button>
            )}
            <button
              type="button"
              disabled={pendente}
              onClick={() => confirm(`Excluir “${d.titulo}”? Ele some do site para os alunos. Dá para desfazer pela lista de conteúdos.`) && executar(() => excluirConteudo(d.id!), () => router.push("/admin/conteudos"))}
              className="w-full rounded-full py-2 text-xs font-semibold text-red-300/80 transition hover:bg-red-500/10 hover:text-red-200"
            >
              Excluir conteúdo
            </button>
          </div>
        )}

        {versoes.length > 0 && (
          <details className="vidro p-4">
            <summary className="cursor-pointer text-xs font-semibold text-white/65">Histórico ({versoes.length})</summary>
            <ul className="mt-3 space-y-1.5">
              {versoes.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-white/50">{new Date(v.criado_em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                  <button
                    type="button"
                    disabled={pendente}
                    onClick={() => confirm("Voltar para esta versão? A versão atual fica guardada no histórico.") && executar(() => restaurarVersao(v.id), () => location.reload())}
                    className="font-semibold text-ouro-300 hover:text-ouro-200"
                  >
                    Restaurar
                  </button>
                </li>
              ))}
            </ul>
          </details>
        )}
      </aside>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import type { ItemChecklist, SecaoChecklist } from "@/lib/conteudo";
import Icone from "./Icone";

function chaves(itens: ItemChecklist[]): string[] {
  return itens.flatMap((i) => [i.chave, ...chaves(i.filhos)]);
}

function textoPuro(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

export default function ChecklistInterativo({
  id,
  titulo,
  secoes,
}: {
  id: string;
  titulo: string;
  secoes: SecaoChecklist[];
}) {
  const armazenamento = `checklist:${id}`;
  const [marcados, setMarcados] = useState<Record<string, boolean>>({});
  const [carregado, setCarregado] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const todas = useMemo(
    () => secoes.flatMap((s) => s.blocos.flatMap((b) => (b.tipo === "itens" ? chaves(b.itens) : []))),
    [secoes],
  );

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(armazenamento);
      if (salvo) setMarcados(JSON.parse(salvo));
    } catch {}
    setCarregado(true);
  }, [armazenamento]);

  useEffect(() => {
    if (!carregado) return;
    try {
      localStorage.setItem(armazenamento, JSON.stringify(marcados));
    } catch {}
  }, [marcados, carregado, armazenamento]);

  const feitos = todas.filter((k) => marcados[k]).length;
  const pct = todas.length ? Math.round((feitos / todas.length) * 100) : 0;

  const alternar = (k: string) => setMarcados((m) => ({ ...m, [k]: !m[k] }));

  const copiarPendentes = async () => {
    const linhas: string[] = [`*${titulo}* — pendências`, ""];
    const percorrer = (itens: ItemChecklist[], nivel: number) => {
      for (const i of itens) {
        if (!marcados[i.chave]) linhas.push(`${"  ".repeat(nivel)}☐ ${textoPuro(i.html)}`);
        percorrer(i.filhos, nivel + 1);
      }
    };
    for (const s of secoes) {
      const antes = linhas.length;
      if (s.titulo) linhas.push(`*${textoPuro(s.titulo)}*`);
      for (const b of s.blocos) if (b.tipo === "itens") percorrer(b.itens, 0);
      if (linhas.length === antes + (s.titulo ? 1 : 0)) linhas.splice(antes);
      else linhas.push("");
    }
    await navigator.clipboard.writeText(linhas.join("\n").trim());
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const renderItens = (itens: ItemChecklist[], nivel = 0) => (
    <ul className={nivel ? "ml-7 mt-1 space-y-1" : "space-y-1"}>
      {itens.map((i) => (
        <li key={i.chave}>
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 hover:bg-stone-50 ${
              marcados[i.chave] ? "text-stone-400" : "text-stone-800"
            }`}
          >
            <input
              type="checkbox"
              checked={!!marcados[i.chave]}
              onChange={() => alternar(i.chave)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-stone-300 accent-mata-700"
            />
            <span
              className={`texto-item leading-relaxed ${marcados[i.chave] ? "line-through" : ""}`}
              dangerouslySetInnerHTML={{ __html: i.html }}
            />
          </label>
          {i.filhos.length > 0 && renderItens(i.filhos, nivel + 1)}
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      <div className="nao-imprimir sticky top-16 z-10 -mx-4 mb-6 border-b border-stone-200 bg-[#fbfaf7]/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:bg-white">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[10rem] flex-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-stone-800">
                {feitos} de {todas.length} itens
              </span>
              <span className="text-stone-500">{pct}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-stone-200">
              <div className="h-full rounded-full bg-mata-600 transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={copiarPendentes}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-600 hover:border-mata-400"
              title="Copia os itens não marcados, prontos para enviar ao cliente"
            >
              <Icone nome="copiar" className="h-4 w-4" />
              {copiado ? "Copiado!" : "Copiar pendências"}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-600 hover:border-mata-400"
            >
              <Icone nome="imprimir" className="h-4 w-4" />
              Imprimir
            </button>
            <button
              onClick={() => confirm("Desmarcar todos os itens deste checklist?") && setMarcados({})}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-600 hover:border-red-300 hover:text-red-700"
            >
              <Icone nome="recomecar" className="h-4 w-4" />
              Limpar
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-stone-500">O progresso fica salvo neste navegador.</p>
      </div>

      <div className="space-y-8">
        {secoes.map((s, n) => (
          <section key={n}>
            {s.titulo &&
              (s.nivel <= 2 ? (
                <h2
                  className="mb-3 border-b border-stone-200 pb-2 text-lg font-semibold text-stone-900"
                  dangerouslySetInnerHTML={{ __html: s.titulo }}
                />
              ) : (
                <h3 className="mb-2 font-semibold text-stone-800" dangerouslySetInnerHTML={{ __html: s.titulo }} />
              ))}
            <div className="space-y-3">
              {s.blocos.map((b, k) =>
                b.tipo === "itens" ? (
                  <div key={k}>{renderItens(b.itens)}</div>
                ) : (
                  <div key={k} className="nota-checklist" dangerouslySetInnerHTML={{ __html: b.html }} />
                ),
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import type { ItemChecklist, SecaoChecklist } from "@/lib/conteudo";
import { registrarVisita, useMarcacoes, useMontado } from "@/lib/estado";
import Icone from "./Icone";

function chaves(itens: ItemChecklist[]): string[] {
  return itens.flatMap((i) => [i.chave, ...chaves(i.filhos)]);
}

function textoPuro(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

function Caixa({ marcado }: { marcado: boolean }) {
  return (
    <span
      className={`mt-0.5 grid h-[22px] w-[22px] shrink-0 place-items-center rounded-lg border transition ${
        marcado
          ? "border-transparent bg-gradient-to-b from-ouro-300 to-ouro-500 text-noite-950 shadow-ouro"
          : "border-white/20 bg-white/[0.03] text-transparent group-hover:border-ouro-400/60"
      }`}
    >
      <Icone nome="check" className="h-3.5 w-3.5" />
    </span>
  );
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
  const { marcados: salvos, definir } = useMarcacoes(id);
  const montado = useMontado();
  const marcados = montado ? salvos : {};
  const [copiado, setCopiado] = useState(false);

  const todas = useMemo(
    () => secoes.flatMap((s) => s.blocos.flatMap((b) => (b.tipo === "itens" ? chaves(b.itens) : []))),
    [secoes],
  );

  const feitos = todas.filter((k) => marcados[k]).length;
  const pct = todas.length ? Math.round((feitos / todas.length) * 100) : 0;

  const alternar = (k: string) => {
    definir({ ...marcados, [k]: !marcados[k] });
    registrarVisita(id);
  };

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
    <ul className={nivel ? "ml-9 mt-0.5" : ""}>
      {itens.map((i) => {
        const m = !!marcados[i.chave];
        return (
          <li key={i.chave}>
            <button
              type="button"
              role="checkbox"
              aria-checked={m}
              onClick={() => alternar(i.chave)}
              className="group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.04]"
            >
              <Caixa marcado={m} />
              <span
                className={`texto-item text-[15px] leading-relaxed transition ${m ? "text-white/35 line-through decoration-white/25 [&_a]:text-white/35 [&_strong]:text-white/40" : "text-white/85"}`}
                dangerouslySetInnerHTML={{ __html: i.html }}
              />
            </button>
            {i.filhos.length > 0 && renderItens(i.filhos, nivel + 1)}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div>
      <div className="nao-imprimir sticky top-16 z-20 -mx-4 mb-6 border-b border-white/[0.06] bg-noite-900/85 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border lg:top-14">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="min-w-[12rem] flex-1">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-white">
                {feitos} <span className="font-normal text-white/40">de {todas.length} itens</span>
              </span>
              <span className="font-display text-lg font-extrabold text-ouro-200">{pct}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-ouro-300 to-ouro-500 transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={copiarPendentes} className="botao-primario" title="Copia os itens não marcados, prontos para enviar ao cliente">
              <Icone nome={copiado ? "check" : "copiar"} className="h-4 w-4" />
              {copiado ? "Copiado!" : "Copiar pendências"}
            </button>
            <button onClick={() => window.print()} className="botao-fantasma" aria-label="Imprimir">
              <Icone nome="imprimir" className="h-4 w-4" />
            </button>
            <button
              onClick={() => confirm("Desmarcar todos os itens deste checklist?") && definir({})}
              className="botao-fantasma"
              aria-label="Limpar checklist"
              title="Limpar"
            >
              <Icone nome="recomecar" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {pct === 100 && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-mata-400/30 bg-mata-500/15 p-4 text-mata-100 animate-surgir">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-mata-500 text-white">
            <Icone nome="check" className="h-5 w-5" />
          </span>
          Checklist completo! Bom trabalho.
        </div>
      )}

      <div className="space-y-4">
        {secoes.map((s, n) => {
          const ks = s.blocos.flatMap((b) => (b.tipo === "itens" ? chaves(b.itens) : []));
          const f = ks.filter((k) => marcados[k]).length;
          return (
            <section key={n} className="vidro p-2 sm:p-3">
              {s.titulo && (
                <div className="flex items-center justify-between gap-3 px-3 pb-1 pt-3">
                  <h2
                    className={`font-display font-bold tracking-tight text-white ${s.nivel <= 2 ? "text-lg" : "text-base text-ouro-100"}`}
                    dangerouslySetInnerHTML={{ __html: s.titulo }}
                  />
                  {ks.length > 0 && (
                    <span className={`chip shrink-0 ${f === ks.length ? "border-mata-400/30 bg-mata-500/15 text-mata-200" : ""}`}>
                      {f}/{ks.length}
                    </span>
                  )}
                </div>
              )}
              <div className="space-y-1">
                {s.blocos.map((b, k) =>
                  b.tipo === "itens" ? (
                    <div key={k}>{renderItens(b.itens)}</div>
                  ) : (
                    <div key={k} className="nota-checklist px-3 py-1" dangerouslySetInnerHTML={{ __html: b.html }} />
                  ),
                )}
              </div>
            </section>
          );
        })}
      </div>
      <p className="nao-imprimir mt-4 text-center text-xs text-white/30">O progresso fica salvo neste aparelho.</p>
    </div>
  );
}

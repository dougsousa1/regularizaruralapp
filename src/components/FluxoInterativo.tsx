"use client";

import Link from "next/link";
import { useState } from "react";
import type { Fluxo } from "@/lib/conteudo";
import { TIPOS, type Tipo } from "@/lib/pilares";
import Icone from "./Icone";

export type LinkResolvido = { id: string; titulo: string; rota: string; tipo: Tipo };

type Passo = { pergunta: string; resposta: string };

export default function FluxoInterativo({
  titulo,
  fluxo,
  links,
}: {
  titulo: string;
  fluxo: Fluxo;
  links: Record<string, LinkResolvido>;
}) {
  const [atual, setAtual] = useState<string>(fluxo.inicio);
  const [resultado, setResultado] = useState<string | null>(null);
  const [historico, setHistorico] = useState<{ chave: string; resposta: string }[]>([]);
  const [copiado, setCopiado] = useState(false);

  const pergunta = fluxo.perguntas[atual];
  const final = resultado ? fluxo.resultados[resultado] : null;

  const escolher = (rotulo: string, proximo?: string, res?: string) => {
    setHistorico((h) => [...h, { chave: atual, resposta: rotulo }]);
    if (res) setResultado(res);
    else if (proximo) setAtual(proximo);
  };

  const voltar = () => {
    const anterior = historico[historico.length - 1];
    if (!anterior) return;
    setHistorico((h) => h.slice(0, -1));
    setResultado(null);
    setAtual(anterior.chave);
  };

  const recomecar = () => {
    setHistorico([]);
    setResultado(null);
    setAtual(fluxo.inicio);
  };

  const caminho: Passo[] = historico.map((h) => ({
    pergunta: fluxo.perguntas[h.chave]?.texto ?? "",
    resposta: h.resposta,
  }));

  const copiarResumo = async () => {
    if (!final) return;
    const texto = [
      `*${titulo}*`,
      "",
      ...caminho.map((p) => `• ${p.pergunta}\n  → ${p.resposta}`),
      "",
      `*Resultado: ${final.titulo}*`,
      final.texto.trim(),
    ].join("\n");
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const total = historico.length + (final ? 0 : 1);

  return (
    <div className="space-y-5">
      {caminho.length > 0 && (
        <ol className="relative space-y-2 pl-6 before:absolute before:bottom-3 before:left-[9px] before:top-3 before:w-px before:bg-white/10">
          {caminho.map((p, i) => (
            <li key={i} className="relative animate-surgir">
              <span className="absolute -left-6 top-3 grid h-[19px] w-[19px] place-items-center rounded-full bg-mata-500 text-white">
                <Icone nome="check" className="h-3 w-3" />
              </span>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-2.5 text-sm">
                <span className="text-white/45">{p.pergunta}</span>
                <span className="mt-0.5 block font-semibold text-white">{p.resposta}</span>
              </div>
            </li>
          ))}
        </ol>
      )}

      {!final && pergunta && (
        <div key={atual} className="vidro-forte relative overflow-hidden p-6 sm:p-8 animate-surgir">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-mata-500/15 blur-3xl" />
          <div className="flex items-center justify-between">
            <p className="rotulo">Pergunta {total}</p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(total, 8) }).map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full ${i === Math.min(total, 8) - 1 ? "w-5 bg-ouro-300" : "w-1.5 bg-white/25"}`} />
              ))}
            </div>
          </div>
          <h2 className="titulo-display mt-3 text-xl leading-snug sm:text-2xl">{pergunta.texto}</h2>
          {pergunta.ajuda && (
            <p className="mt-3 flex gap-2 rounded-xl bg-white/[0.04] p-3 text-sm leading-relaxed text-white/55">
              <Icone nome="alerta" className="mt-0.5 h-4 w-4 shrink-0 text-ouro-300" />
              {pergunta.ajuda}
            </p>
          )}
          <div className="mt-6 grid gap-2.5">
            {pergunta.opcoes.map((o) => (
              <button
                key={o.rotulo}
                onClick={() => escolher(o.rotulo, o.proximo, o.resultado)}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-left font-medium text-white/90 transition hover:border-ouro-400/50 hover:bg-ouro-400/[0.08] active:scale-[0.99]"
              >
                <span>{o.rotulo}</span>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.06] text-white/50 transition group-hover:bg-ouro-400 group-hover:text-noite-950">
                  <Icone nome="seta" className="h-3.5 w-3.5" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {final && (
        <div className="relative overflow-hidden rounded-[24px] border border-ouro-400/30 bg-gradient-to-br from-mata-700 via-mata-900 to-noite-950 p-6 shadow-2xl shadow-black/50 sm:p-8 animate-surgir">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-ouro-400/20 blur-3xl" />
          <p className="rotulo flex items-center gap-2">
            <Icone nome="raio" className="h-3.5 w-3.5" /> Resultado
          </p>
          <h2 className="titulo-display mt-3 text-2xl sm:text-3xl">{final.titulo}</h2>
          <p className="mt-4 whitespace-pre-line text-[15.5px] leading-relaxed text-white/80">{final.texto.trim()}</p>
          {final.links && final.links.some((l) => links[l]) && (
            <div className="mt-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Para aprofundar</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {final.links
                  .filter((l) => links[l])
                  .map((l) => (
                    <Link
                      key={l}
                      href={links[l].rota}
                      className="group flex items-center gap-3 rounded-xl border border-white/10 bg-noite-950/40 px-3 py-3 text-sm backdrop-blur transition hover:border-ouro-400/40"
                    >
                      <Icone nome={links[l].tipo} className="h-4 w-4 shrink-0 text-ouro-300" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-white">{links[l].titulo}</span>
                        <span className="block text-xs text-white/45">{TIPOS[links[l].tipo].nome}</span>
                      </span>
                      <Icone nome="seta" className="h-4 w-4 text-white/30 group-hover:text-ouro-300" />
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="nao-imprimir flex flex-wrap gap-2">
        {historico.length > 0 && (
          <button onClick={voltar} className="botao-fantasma">
            <Icone nome="voltar" className="h-4 w-4" />
            Voltar
          </button>
        )}
        {historico.length > 0 && (
          <button onClick={recomecar} className="botao-fantasma">
            <Icone nome="recomecar" className="h-4 w-4" />
            Recomeçar
          </button>
        )}
        {final && (
          <>
            <button onClick={copiarResumo} className="botao-primario">
              <Icone nome={copiado ? "check" : "copiar"} className="h-4 w-4" />
              {copiado ? "Copiado!" : "Copiar resumo"}
            </button>
            <button onClick={() => window.print()} className="botao-fantasma">
              <Icone nome="imprimir" className="h-4 w-4" />
              Imprimir
            </button>
          </>
        )}
      </div>
    </div>
  );
}

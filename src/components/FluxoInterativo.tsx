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

  return (
    <div className="space-y-6">
      {caminho.length > 0 && (
        <ol className="space-y-2">
          {caminho.map((p, i) => (
            <li key={i} className="rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm">
              <span className="text-stone-500">{p.pergunta}</span>
              <span className="mt-0.5 flex items-center gap-1.5 font-medium text-mata-800">
                <Icone nome="seta" className="h-3.5 w-3.5" />
                {p.resposta}
              </span>
            </li>
          ))}
        </ol>
      )}

      {!final && pergunta && (
        <div className="rounded-2xl border border-mata-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-mata-700">Pergunta {historico.length + 1}</p>
          <h2 className="mt-2 text-xl font-semibold text-stone-900">{pergunta.texto}</h2>
          {pergunta.ajuda && <p className="mt-2 text-sm text-stone-600">{pergunta.ajuda}</p>}
          <div className="mt-5 grid gap-2">
            {pergunta.opcoes.map((o) => (
              <button
                key={o.rotulo}
                onClick={() => escolher(o.rotulo, o.proximo, o.resultado)}
                className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 px-4 py-3 text-left text-stone-800 transition hover:border-mata-500 hover:bg-mata-50"
              >
                <span>{o.rotulo}</span>
                <Icone nome="seta" className="h-4 w-4 shrink-0 text-mata-600" />
              </button>
            ))}
          </div>
        </div>
      )}

      {final && (
        <div className="rounded-2xl bg-mata-800 p-6 text-white shadow-md">
          <p className="text-xs font-medium uppercase tracking-wider text-mata-200">Resultado</p>
          <h2 className="mt-2 text-2xl font-semibold">{final.titulo}</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-mata-50">{final.texto.trim()}</p>
          {final.links && final.links.some((l) => links[l]) && (
            <div className="mt-6">
              <p className="text-sm font-medium text-mata-200">Para aprofundar</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {final.links
                  .filter((l) => links[l])
                  .map((l) => (
                    <Link
                      key={l}
                      href={links[l].rota}
                      className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2.5 text-sm hover:bg-white/20"
                    >
                      <Icone nome={links[l].tipo} className="h-4 w-4 shrink-0" />
                      <span className="min-w-0">
                        <span className="block">{links[l].titulo}</span>
                        <span className="block text-xs text-mata-200">{TIPOS[links[l].tipo].nome}</span>
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="nao-imprimir flex flex-wrap gap-2">
        {historico.length > 0 && (
          <button
            onClick={voltar}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-600 hover:border-mata-400"
          >
            <Icone nome="voltar" className="h-4 w-4" />
            Voltar
          </button>
        )}
        {historico.length > 0 && (
          <button
            onClick={recomecar}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-600 hover:border-mata-400"
          >
            <Icone nome="recomecar" className="h-4 w-4" />
            Recomeçar
          </button>
        )}
        {final && (
          <>
            <button
              onClick={copiarResumo}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-600 hover:border-mata-400"
            >
              <Icone nome="copiar" className="h-4 w-4" />
              {copiado ? "Copiado!" : "Copiar resumo"}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-600 hover:border-mata-400"
            >
              <Icone nome="imprimir" className="h-4 w-4" />
              Imprimir
            </button>
          </>
        )}
      </div>
    </div>
  );
}

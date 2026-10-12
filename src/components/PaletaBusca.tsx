"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type MiniSearch from "minisearch";
import { buscar, carregarIndice, type DocBusca, type ResultadoBusca } from "@/lib/busca";
import { getPilar, rotaDoItem, TIPOS } from "@/lib/pilares";
import { IconeTipo } from "./Cartoes";
import Icone from "./Icone";

export const EVENTO_ABRIR_BUSCA = "abrir-busca";

export function abrirBusca(consulta = "") {
  window.dispatchEvent(new CustomEvent(EVENTO_ABRIR_BUSCA, { detail: consulta }));
}

export default function PaletaBusca() {
  const router = useRouter();
  const [aberta, setAberta] = useState(false);
  const [consulta, setConsulta] = useState("");
  const [indice, setIndice] = useState<MiniSearch<DocBusca> | null>(null);
  const [erro, setErro] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const abrir = useCallback((q = "") => {
    setConsulta(q);
    setAtivo(0);
    setAberta(true);
  }, []);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      const digitando = alvo.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(alvo.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !digitando)) {
        e.preventDefault();
        abrir();
      }
    };
    const aoAbrir = (e: Event) => abrir((e as CustomEvent<string>).detail ?? "");
    window.addEventListener("keydown", aoTeclar);
    window.addEventListener(EVENTO_ABRIR_BUSCA, aoAbrir);
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      window.removeEventListener(EVENTO_ABRIR_BUSCA, aoAbrir);
    };
  }, [abrir]);

  useEffect(() => {
    if (!aberta) return;
    input.current?.focus();
    document.body.style.overflow = "hidden";
    carregarIndice()
      .then(setIndice)
      .catch(() => setErro(true));
    return () => {
      document.body.style.overflow = "";
    };
  }, [aberta]);

  const resultados: ResultadoBusca[] = indice ? buscar(indice, consulta, 12) : [];

  const ir = (r: ResultadoBusca) => {
    setAberta(false);
    router.push(rotaDoItem(r.tipo, r.id));
  };

  const verTodos = () => {
    setAberta(false);
    router.push(`/buscar?q=${encodeURIComponent(consulta)}`);
  };

  if (!aberta) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-noite-950/70 px-3 pt-[8vh] backdrop-blur-md sm:px-4 sm:pt-[12vh]"
      onMouseDown={(e) => e.target === e.currentTarget && setAberta(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Buscar na base"
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-noite-850/95 shadow-2xl shadow-black/70 animate-surgir">
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-5">
          <Icone nome="busca" className="h-5 w-5 text-ouro-300" />
          <input
            ref={input}
            value={consulta}
            onChange={(e) => {
              setConsulta(e.target.value);
              setAtivo(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setAberta(false);
              else if (e.key === "ArrowDown") {
                e.preventDefault();
                setAtivo((a) => Math.min(a + 1, resultados.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setAtivo((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter" && resultados[ativo]) {
                ir(resultados[ativo]);
              }
            }}
            placeholder="Tema, lei ou situação do cliente…"
            className="h-16 w-full bg-transparent text-base text-white outline-none placeholder:text-white/30 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <button
            onClick={() => setAberta(false)}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.06] text-white/50 hover:text-white"
            aria-label="Fechar"
          >
            <Icone nome="fechar" className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[62vh] overflow-y-auto p-2">
          {erro && <p className="p-5 text-sm text-red-300">Não foi possível carregar a busca. Tente de novo.</p>}
          {!erro && !indice && (
            <div className="space-y-2 p-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
              ))}
            </div>
          )}
          {indice && !consulta.trim() && (
            <div className="p-4">
              <p className="rotulo text-white/40">Experimente</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["arrendamento", "CCIR", "georreferenciamento", "ITR", "reserva legal", "Decreto 59.566", "leilão"].map((t) => (
                  <button key={t} onClick={() => setConsulta(t)} className="chip transition hover:border-ouro-400/40 hover:text-white">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
          {indice && consulta.trim() && !resultados.length && (
            <p className="p-5 text-sm text-white/50">Nada encontrado para “{consulta}”. Tente outras palavras.</p>
          )}
          <ul>
            {resultados.map((r, i) => (
              <li key={r.id}>
                <button
                  onMouseEnter={() => setAtivo(i)}
                  onClick={() => ir(r)}
                  className={`flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition ${
                    i === ativo ? "bg-white/[0.07]" : ""
                  }`}
                >
                  <IconeTipo tipo={r.tipo} tamanho="h-9 w-9" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-white">{r.titulo}</span>
                    <span className="block text-[11px] font-medium uppercase tracking-wider text-white/35">
                      {TIPOS[r.tipo].nome} · {getPilar(r.pilar)?.nome}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-[13px] leading-relaxed text-white/50">{r.resumo}</span>
                  </span>
                  {i === ativo && <Icone nome="seta" className="mt-2 h-4 w-4 shrink-0 text-ouro-300" />}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-3 text-xs text-white/35">
          <span className="hidden sm:inline">↑↓ navegar · Enter abrir · Esc fechar</span>
          {consulta.trim() && resultados.length > 0 && (
            <button onClick={verTodos} className="font-semibold text-ouro-300 hover:text-ouro-200">
              Ver todos os resultados →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

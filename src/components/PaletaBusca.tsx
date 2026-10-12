"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type MiniSearch from "minisearch";
import { buscar, carregarIndice, type DocBusca, type ResultadoBusca } from "@/lib/busca";
import { getPilar, rotaDoItem, TIPOS } from "@/lib/pilares";
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
      className="fixed inset-0 z-50 flex items-start justify-center bg-stone-900/40 px-4 pt-[10vh] backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && setAberta(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Buscar na base"
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-stone-200">
        <div className="flex items-center gap-3 border-b border-stone-200 px-4">
          <Icone nome="busca" className="h-5 w-5 text-stone-400" />
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
            placeholder="Ex.: preço do arrendamento, CCIR de posse, uso consolidado..."
            className="h-14 w-full bg-transparent text-base outline-none placeholder:text-stone-400"
          />
          <kbd className="hidden rounded border border-stone-200 px-1.5 text-xs text-stone-400 sm:block">Esc</kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {erro && <p className="p-6 text-sm text-red-700">Não foi possível carregar a busca. Tente de novo.</p>}
          {!erro && !indice && <p className="p-6 text-sm text-stone-500">Carregando a base…</p>}
          {indice && !consulta.trim() && (
            <p className="p-6 text-sm text-stone-500">
              Digite um assunto, uma lei (ex.: <em>Decreto 59.566</em>) ou uma situação do seu cliente.
            </p>
          )}
          {indice && consulta.trim() && !resultados.length && (
            <p className="p-6 text-sm text-stone-500">Nada encontrado para “{consulta}”. Tente outras palavras.</p>
          )}
          <ul>
            {resultados.map((r, i) => (
              <li key={r.id}>
                <button
                  onMouseEnter={() => setAtivo(i)}
                  onClick={() => ir(r)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left ${
                    i === ativo ? "bg-mata-50" : ""
                  }`}
                >
                  <Icone nome={r.tipo} className="mt-0.5 h-5 w-5 shrink-0 text-mata-600" />
                  <span className="min-w-0">
                    <span className="block font-medium text-stone-900">{r.titulo}</span>
                    <span className="block text-xs text-stone-500">
                      {TIPOS[r.tipo].nome} · {getPilar(r.pilar)?.nome}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-sm text-stone-600">{r.resumo}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {consulta.trim() && resultados.length > 0 && (
          <button
            onClick={verTodos}
            className="w-full border-t border-stone-200 px-4 py-3 text-left text-sm font-medium text-mata-700 hover:bg-stone-50"
          >
            Ver todos os resultados para “{consulta}” →
          </button>
        )}
      </div>
    </div>
  );
}

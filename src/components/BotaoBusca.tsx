"use client";

import { abrirBusca } from "./PaletaBusca";
import Icone from "./Icone";

export default function BotaoBusca({ grande = false }: { grande?: boolean }) {
  if (grande) {
    return (
      <button
        onClick={() => abrirBusca()}
        className="flex h-14 w-full items-center gap-3 rounded-xl bg-white px-5 text-left text-stone-500 shadow-lg ring-1 ring-stone-200 transition hover:ring-mata-400"
      >
        <Icone nome="busca" className="h-5 w-5 text-mata-600" />
        <span className="flex-1 truncate">Qual é o caso do seu cliente? Busque um tema, lei ou situação…</span>
        <kbd className="hidden rounded border border-stone-200 px-2 py-0.5 text-xs sm:block">Ctrl K</kbd>
      </button>
    );
  }
  return (
    <button
      onClick={() => abrirBusca()}
      className="flex h-9 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-500 hover:border-mata-400"
      aria-label="Buscar"
    >
      <Icone nome="busca" className="h-4 w-4" />
      <span className="hidden md:inline">Buscar</span>
      <kbd className="hidden rounded border border-stone-200 px-1 text-[10px] lg:inline">Ctrl K</kbd>
    </button>
  );
}

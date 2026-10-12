"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function MenuCelular({ itens }: { itens: { href: string; rotulo: string }[] }) {
  const [aberto, setAberto] = useState(false);
  const caminho = usePathname();

  useEffect(() => setAberto(false), [caminho]);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setAberto((a) => !a)}
        className="grid h-9 w-9 place-items-center rounded-lg border border-stone-200 bg-white"
        aria-label="Abrir menu"
        aria-expanded={aberto}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d={aberto ? "M6 6l12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"} strokeLinecap="round" />
        </svg>
      </button>
      {aberto && (
        <nav className="absolute inset-x-0 top-16 border-b border-stone-200 bg-white shadow-lg">
          {itens.map((n) => (
            <Link key={n.href} href={n.href} className="block border-t border-stone-100 px-6 py-3 text-stone-700">
              {n.rotulo}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

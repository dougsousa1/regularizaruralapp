"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ABAS = [
  { href: "/admin", rotulo: "Alunos e acessos" },
  { href: "/admin/conteudos", rotulo: "Conteúdos" },
  { href: "/admin/pilares", rotulo: "Pilares" },
];

export default function AbasAdmin() {
  const caminho = usePathname();
  return (
    <nav className="sem-barra -mx-5 mb-6 flex gap-1 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      {ABAS.map((a) => {
        const sel = a.href === "/admin" ? caminho === "/admin" : caminho.startsWith(a.href);
        return (
          <Link
            key={a.href}
            href={a.href}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${sel ? "bg-white text-noite-950" : "text-white/55 hover:bg-white/[0.06] hover:text-white"}`}
          >
            {a.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}

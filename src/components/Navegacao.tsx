"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AnelProgresso from "./AnelProgresso";
import Icone from "./Icone";
import Logo from "./Logo";
import { abrirBusca } from "./PaletaBusca";

export type PilarNav = { slug: string; nome: string; icone: string; total: number };

const PRINCIPAL = [
  { href: "/", rotulo: "Início", icone: "inicio" },
  { href: "/fluxos", rotulo: "Fluxos de decisão", icone: "fluxo" },
  { href: "/checklists", rotulo: "Checklists", icone: "checklist" },
  { href: "/referencias", rotulo: "Tabelas e glossários", icone: "referencia" },
  { href: "/salvos", rotulo: "Meus salvos", icone: "salvo" },
];

function ativo(caminho: string, href: string) {
  return href === "/" ? caminho === "/" : caminho.startsWith(href);
}

export function BarraLateral({ pilares, totalEstudo }: { pilares: PilarNav[]; totalEstudo: number }) {
  const caminho = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-white/[0.06] bg-noite-950/70 backdrop-blur-xl lg:flex">
      <div className="px-6 pb-5 pt-7">
        <Logo />
      </div>
      <div className="px-4">
        <button
          onClick={() => abrirBusca()}
          className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white/50 transition hover:border-ouro-400/30 hover:text-white/80"
        >
          <Icone nome="busca" className="h-4 w-4" />
          <span className="flex-1 text-left">Buscar…</span>
          <kbd className="rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/40">Ctrl K</kbd>
        </button>
      </div>

      <nav className="sem-barra mt-5 flex-1 overflow-y-auto px-3 pb-6">
        <ul className="space-y-0.5">
          {PRINCIPAL.map((n) => {
            const sel = ativo(caminho, n.href);
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    sel ? "bg-white/[0.07] text-white" : "text-white/55 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <Icone nome={n.icone} className={`h-[18px] w-[18px] ${sel ? "text-ouro-300" : ""}`} />
                  {n.rotulo}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="rotulo mb-2 mt-7 px-3 text-white/35">Pilares</p>
        <ul className="space-y-0.5">
          {pilares.map((p) => {
            const sel = caminho === `/pilar/${p.slug}`;
            return (
              <li key={p.slug}>
                <Link
                  href={`/pilar/${p.slug}`}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                    sel ? "bg-white/[0.07] text-white" : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-lg border transition ${
                      sel
                        ? "border-ouro-400/40 bg-ouro-400/15 text-ouro-300"
                        : "border-white/[0.08] bg-white/[0.03] text-white/50 group-hover:text-ouro-300"
                    }`}
                  >
                    <Icone nome={p.icone} className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex-1 truncate">{p.nome}</span>
                  <span className="text-[11px] tabular-nums text-white/30">{p.total}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/[0.06] p-4">
        <Link href="/salvos" className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/[0.04]">
          <AnelProgresso total={totalEstudo} tamanho={42} />
          <span className="min-w-0 text-xs leading-tight">
            <span className="block font-semibold text-white">Seu progresso</span>
            <span className="text-white/45">Guias e tabelas concluídos</span>
          </span>
        </Link>
        <Link
          href="/revisao"
          className="mt-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-white/35 transition hover:text-white/70"
        >
          <Icone nome="escudo" className="h-3.5 w-3.5" />
          Painel de revisão da mentora
        </Link>
      </div>
    </aside>
  );
}

export function BarraTopo({ totalEstudo }: { totalEstudo: number }) {
  return (
    <header className="nao-imprimir sticky top-0 z-30 border-b border-white/[0.06] bg-noite-900/75 backdrop-blur-xl lg:border-transparent lg:bg-transparent lg:backdrop-blur-none">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:h-14 lg:justify-end lg:px-10">
        <div className="lg:hidden">
          <Logo compacto />
        </div>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <button
            onClick={() => abrirBusca()}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white/80 transition hover:border-ouro-400/40 hover:text-white lg:hidden"
            aria-label="Buscar"
          >
            <Icone nome="busca" className="h-[18px] w-[18px]" />
          </button>
          <Link href="/salvos" aria-label="Seu progresso" className="lg:hidden">
            <AnelProgresso total={totalEstudo} tamanho={40} />
          </Link>
        </div>
      </div>
    </header>
  );
}

const ABAS = [
  { href: "/", rotulo: "Início", icone: "inicio" },
  { href: "/pilares", rotulo: "Pilares", icone: "grade" },
  { href: "#buscar", rotulo: "Buscar", icone: "busca" },
  { href: "/checklists", rotulo: "Checklists", icone: "checklist" },
  { href: "/salvos", rotulo: "Salvos", icone: "salvo" },
];

export function AbasCelular() {
  const caminho = usePathname();
  return (
    <nav className="nao-imprimir fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.07] bg-noite-950/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {ABAS.map((a) => {
          const sel =
            a.href !== "#buscar" &&
            (ativo(caminho, a.href) || (a.href === "/pilares" && caminho.startsWith("/pilar/")));
          const conteudo = (
            <>
              {a.href === "#buscar" ? (
                <span className="-mt-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-b from-ouro-300 to-ouro-500 text-noite-950 shadow-ouro">
                  <Icone nome="busca" className="h-5 w-5" />
                </span>
              ) : (
                <Icone nome={a.icone} className={`h-[22px] w-[22px] ${sel ? "text-ouro-300" : ""}`} />
              )}
              <span className="mt-1">{a.rotulo}</span>
            </>
          );
          const classe = `flex flex-col items-center py-2 text-[10.5px] font-medium ${sel ? "text-white" : "text-white/45"}`;
          return (
            <li key={a.href}>
              {a.href === "#buscar" ? (
                <button onClick={() => abrirBusca()} className={`${classe} w-full`}>
                  {conteudo}
                </button>
              ) : (
                <Link href={a.href} className={classe}>
                  {conteudo}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

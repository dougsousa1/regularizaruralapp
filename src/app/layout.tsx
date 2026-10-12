import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import BotaoBusca from "@/components/BotaoBusca";
import PaletaBusca from "@/components/PaletaBusca";
import MenuCelular from "@/components/MenuCelular";

export const metadata: Metadata = {
  title: { default: "Regulariza Rural — Central de Consulta", template: "%s · Regulariza Rural" },
  description:
    "Guias práticos, checklists, fluxos de decisão e tabelas de direito agrário e regularização rural para os alunos da mentoria.",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/#pilares", rotulo: "Pilares" },
  { href: "/fluxos", rotulo: "Fluxos de decisão" },
  { href: "/checklists", rotulo: "Checklists" },
  { href: "/referencias", rotulo: "Tabelas" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col font-sans">
        <header className="sticky top-0 z-40 border-b border-stone-200 bg-[#fbfaf7]/90 backdrop-blur">
          <div className="container-site flex h-16 items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-mata-700 text-sm font-bold text-white">
                RR
              </span>
              <span className="font-semibold leading-tight text-stone-900">
                Regulariza Rural
                <span className="block text-[11px] font-normal text-stone-500">Central de consulta</span>
              </span>
            </Link>
            <nav className="hidden flex-1 items-center gap-5 text-sm text-stone-600 md:flex">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="hover:text-mata-700">
                  {n.rotulo}
                </Link>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2 md:ml-0">
              <BotaoBusca />
              <MenuCelular itens={NAV} />
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="mt-16 border-t border-stone-200 bg-white">
          <div className="container-site flex flex-col gap-2 py-8 text-sm text-stone-500 sm:flex-row sm:justify-between">
            <p>Conteúdo exclusivo para alunos da mentoria. Baseado nas aulas e revisado pela mentora.</p>
            <p>
              Material de apoio — confira sempre a legislação vigente antes de agir no caso concreto.
            </p>
          </div>
        </footer>
        <PaletaBusca />
      </body>
    </html>
  );
}

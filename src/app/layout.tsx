import type { Metadata, Viewport } from "next";
import { Inter_Tight, Manrope } from "next/font/google";
import "./globals.css";
import { AbasCelular, BarraLateral, BarraTopo } from "@/components/Navegacao";
import PaletaBusca from "@/components/PaletaBusca";
import { itensDoPilar, todosItens } from "@/lib/conteudo";
import { PILARES } from "@/lib/pilares";

const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Regulariza Rural — Central de Consulta", template: "%s · Regulariza Rural" },
  description:
    "Guias práticos, checklists, fluxos de decisão e tabelas de direito agrário e regularização rural para os alunos do Regulariza Rural.",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Regulariza Rural", statusBarStyle: "black-translucent" },
  icons: { icon: "/icone-192.png", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#06100c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pilares = PILARES.map((p) => ({
    slug: p.slug,
    nome: p.nome,
    icone: p.icone,
    total: itensDoPilar(p.slug).length,
  }));
  const totalEstudo = todosItens().filter((i) => i.tipo === "guia" || i.tipo === "referencia").length;

  return (
    <html lang="pt-BR" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen font-sans">
        <BarraLateral pilares={pilares} totalEstudo={totalEstudo} />
        <div className="flex min-h-screen flex-col lg:pl-72">
          <BarraTopo totalEstudo={totalEstudo} />
          <main className="flex-1 pb-10 lg:pb-12">{children}</main>
          <footer className="nao-imprimir border-t border-white/[0.06] pb-20 lg:pb-0">
            <div className="flex flex-col gap-1 px-4 py-6 text-xs text-white/35 sm:px-6 lg:flex-row lg:justify-between lg:px-10">
              <p>Conteúdo exclusivo para alunos do Regulariza Rural.</p>
              <p>Material de apoio — confira sempre a legislação vigente antes de agir no caso concreto.</p>
            </div>
          </footer>
        </div>
        <AbasCelular />
        <PaletaBusca />
      </body>
    </html>
  );
}

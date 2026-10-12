import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Fonte da marca. A Louis George Café traz em branco alguns caracteres (º, ª, ², ½, setas...);
// o unicode-range tira esses da fonte para o navegador desenhá-los com a Manrope.
const marca = localFont({
  src: [
    { path: "../fontes/LouisGeorgeCafe-Light.ttf", weight: "300", style: "normal" },
    { path: "../fontes/LouisGeorgeCafe-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fontes/LouisGeorgeCafe-Italic.ttf", weight: "400", style: "italic" },
    { path: "../fontes/LouisGeorgeCafe-Bold.ttf", weight: "700", style: "normal" },
    { path: "../fontes/LouisGeorgeCafe-BoldItalic.ttf", weight: "700", style: "italic" },
  ],
  variable: "--font-marca",
  display: "swap",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0000-00A9, U+00AB-00AE, U+00B0-00B1, U+00B4-00B8, U+00BB, U+00BF-00EF, U+00F1-0130, U+0132-02D7, U+02D9-02DA, U+02DC, U+02DE-2021, U+2023-2201, U+2203-2205, U+2207-220E, U+2210, U+2212-2219, U+221B-221D, U+221F-222A, U+222C-10FFFF",
    },
  ],
});
const apoio = Manrope({ subsets: ["latin"], variable: "--font-apoio", display: "swap" });

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
  return (
    <html lang="pt-BR" className={`${marca.variable} ${apoio.variable}`}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}

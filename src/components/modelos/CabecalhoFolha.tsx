"use client";

import Link from "next/link";
import { temCabecalho, type Escritorio, type Logo } from "@/lib/escritorio";

export default function CabecalhoFolha({ escritorio, logo }: { escritorio: Escritorio | null; logo: Logo | null }) {
  if (!escritorio) return <div className="mb-8 h-14" />;
  if (!temCabecalho(escritorio, logo)) {
    return (
      <Link
        href="/escritorio"
        className="nao-imprimir mb-8 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-stone-300 py-4 text-sm text-stone-500 transition hover:border-amber-500 hover:text-amber-700"
      >
        + Adicione a logo e os dados do seu escritório para aparecerem aqui
      </Link>
    );
  }
  const al = escritorio.logo_posicao === "centro" ? "items-center text-center" : escritorio.logo_posicao === "direita" ? "items-end text-right" : "items-start text-left";
  return (
    <div className={`mb-8 flex flex-col gap-1 border-b border-[#b08a4a] pb-3 ${al}`}>
      {logo && <img src={logo.url} alt="" className="mb-1 h-14 max-w-[260px] object-contain" />}
      {escritorio.nome && <p className="text-[10pt] font-bold text-stone-800">{escritorio.nome}</p>}
      {(escritorio.profissional || escritorio.registro) && (
        <p className="text-[8pt] text-stone-500">{[escritorio.profissional, escritorio.registro].filter(Boolean).join(" · ")}</p>
      )}
      {(escritorio.endereco || escritorio.telefone || escritorio.email || escritorio.site) && (
        <p className="text-[8pt] text-stone-500">
          {[escritorio.endereco, escritorio.telefone, escritorio.email, escritorio.site].filter(Boolean).join(" · ")}
        </p>
      )}
    </div>
  );
}

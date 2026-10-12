"use client";

import { useState } from "react";
import Icone from "./Icone";

export function BotaoImprimir() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-600 hover:border-mata-400"
    >
      <Icone nome="imprimir" className="h-4 w-4" />
      Imprimir
    </button>
  );
}

export function BotaoCopiar({ texto, rotulo = "Copiar link" }: { texto?: string; rotulo?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(texto ?? window.location.href);
        setOk(true);
        setTimeout(() => setOk(false), 2000);
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-600 hover:border-mata-400"
    >
      <Icone nome="copiar" className="h-4 w-4" />
      {ok ? "Copiado!" : rotulo}
    </button>
  );
}

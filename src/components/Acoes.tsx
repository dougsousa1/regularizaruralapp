"use client";

import { useEffect, useState } from "react";
import { registrarVisita, useConcluidos, useFavoritos, useMontado } from "@/lib/estado";
import Icone from "./Icone";

export function BotaoImprimir() {
  return (
    <button onClick={() => window.print()} className="botao-fantasma" aria-label="Imprimir">
      <Icone nome="imprimir" className="h-4 w-4" />
      <span className="hidden sm:inline">Imprimir</span>
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
      className="botao-fantasma"
      aria-label={rotulo}
    >
      <Icone nome={ok ? "check" : "copiar"} className="h-4 w-4" />
      <span className="hidden sm:inline">{ok ? "Copiado!" : rotulo}</span>
    </button>
  );
}

export function BotaoSalvar({ id }: { id: string }) {
  const { tem, alternar } = useFavoritos();
  const montado = useMontado();
  const salvo = montado && tem(id);
  return (
    <button
      onClick={() => alternar(id)}
      className={salvo ? "botao border border-ouro-400/40 bg-ouro-400/15 text-ouro-200" : "botao-fantasma"}
      aria-pressed={salvo}
    >
      <Icone nome="salvo" cheio={salvo} className="h-4 w-4" />
      {salvo ? "Salvo" : "Salvar"}
    </button>
  );
}

export function BotaoConcluir({ id, grande = false }: { id: string; grande?: boolean }) {
  const { tem, alternar } = useConcluidos();
  const montado = useMontado();
  const feito = montado && tem(id);
  if (grande) {
    return (
      <button
        onClick={() => alternar(id)}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold transition ${
          feito
            ? "border border-mata-400/40 bg-mata-500/15 text-mata-200"
            : "bg-gradient-to-b from-ouro-300 to-ouro-500 text-noite-950 shadow-ouro hover:from-ouro-200"
        }`}
      >
        <Icone nome="check" className="h-5 w-5" />
        {feito ? "Concluído — clique para desfazer" : "Marcar como concluído"}
      </button>
    );
  }
  return (
    <button
      onClick={() => alternar(id)}
      className={feito ? "botao border border-mata-400/40 bg-mata-500/20 text-mata-200" : "botao-primario"}
      aria-pressed={feito}
    >
      <Icone nome="check" className="h-4 w-4" />
      {feito ? "Concluído" : "Concluir"}
    </button>
  );
}

export function RegistrarVisita({ id }: { id: string }) {
  useEffect(() => registrarVisita(id), [id]);
  return null;
}

export function BarraLeitura() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const atualizar = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setPct(max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0);
    };
    atualizar();
    window.addEventListener("scroll", atualizar, { passive: true });
    window.addEventListener("resize", atualizar);
    return () => {
      window.removeEventListener("scroll", atualizar);
      window.removeEventListener("resize", atualizar);
    };
  }, []);
  return (
    <div className="nao-imprimir fixed inset-x-0 top-0 z-50 h-0.5 lg:left-72">
      <div className="h-full bg-gradient-to-r from-ouro-300 to-ouro-500 transition-[width] duration-150" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Indice({ secoes }: { secoes: { id: string; titulo: string }[] }) {
  const [atual, setAtual] = useState<string>(secoes[0]?.id ?? "");
  useEffect(() => {
    const alvos = secoes.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    const obs = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visivel) setAtual(visivel.target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    alvos.forEach((a) => obs.observe(a));
    return () => obs.disconnect();
  }, [secoes]);
  return (
    <ul className="mt-3 space-y-0.5 border-l border-white/[0.08]">
      {secoes.map((s) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            className={`-ml-px block border-l py-1.5 pl-4 text-[13px] leading-snug transition ${
              atual === s.id ? "border-ouro-400 font-semibold text-white" : "border-transparent text-white/45 hover:text-white/80"
            }`}
          >
            {s.titulo}
          </a>
        </li>
      ))}
    </ul>
  );
}

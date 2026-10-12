"use client";

import { useConcluidos, useMontado } from "@/lib/estado";

export default function AnelProgresso({ total, tamanho = 40 }: { total: number; tamanho?: number }) {
  const { lista } = useConcluidos();
  const montado = useMontado();
  const pct = montado && total ? Math.round((lista.length / total) * 100) : 0;
  const r = tamanho / 2 - 3;
  const c = 2 * Math.PI * r;
  return (
    <span
      className="relative inline-grid shrink-0 place-items-center"
      style={{ width: tamanho, height: tamanho }}
      title={`Você concluiu ${montado ? lista.length : 0} de ${total} guias e tabelas`}
    >
      <svg width={tamanho} height={tamanho} className="-rotate-90">
        <circle cx={tamanho / 2} cy={tamanho / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={3} />
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={r}
          fill="none"
          stroke="url(#ouro-anel)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          className="transition-[stroke-dashoffset] duration-700"
        />
        <defs>
          <linearGradient id="ouro-anel" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#ecd197" />
            <stop offset="1" stopColor="#be8a3d" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-[10px] font-bold text-white">{pct}%</span>
    </span>
  );
}

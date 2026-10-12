"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DefinicaoCampo } from "@/lib/modelos-tipos";
import Icone from "../Icone";

const ESTADOS_CIVIS = ["solteiro(a)", "casado(a)", "divorciado(a)", "viúvo(a)", "separado(a)", "em união estável"];

function mascara(tipo: string, v: string) {
  const d = v.replace(/\D/g, "");
  if (tipo === "cpf") return d.slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  if (tipo === "cnpj")
    return d
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  if (tipo === "cep") return d.slice(0, 8).replace(/(\d{5})(\d{1,3})$/, "$1-$2");
  if (tipo === "telefone") return d.slice(0, 11).replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4,5})(\d{4})$/, "$1-$2");
  return v;
}

export default function PainelCampos({
  campos,
  grupos,
  valores,
  foco,
  aoMudar,
  aoFocar,
}: {
  campos: Record<string, DefinicaoCampo>;
  grupos: string[];
  valores: Record<string, string>;
  foco: string | null;
  aoMudar: (chave: string, valor: string) => void;
  aoFocar: (chave: string) => void;
}) {
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const [busca, setBusca] = useState("");
  const [soPendentes, setSoPendentes] = useState(false);
  const preenchiveis = useMemo(() => Object.entries(campos).filter(([, d]) => d.tipo !== "nota"), [campos]);
  const notas = useMemo(() => Object.entries(campos).filter(([, d]) => d.tipo === "nota"), [campos]);
  const feitos = preenchiveis.filter(([k]) => (valores[k] ?? "").trim()).length;
  const pct = preenchiveis.length ? Math.round((feitos / preenchiveis.length) * 100) : 100;

  // Quando o aluno clica num campo no documento, rola o painel até ele e foca o campo.
  useEffect(() => {
    if (!foco) return;
    const el = refs.current[foco];
    if (el && document.activeElement !== el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      el.focus({ preventScroll: true });
    }
  }, [foco]);

  const proximoPendente = () => {
    const prox = preenchiveis.find(([k]) => !(valores[k] ?? "").trim());
    if (prox) aoFocar(prox[0]);
  };

  const q = busca.trim().toLowerCase();
  const visivel = (k: string, d: DefinicaoCampo) =>
    (!soPendentes || !(valores[k] ?? "").trim()) && (!q || d.rotulo.toLowerCase().includes(q) || d.grupo.toLowerCase().includes(q));

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/[0.07] p-5">
        <div className="flex items-baseline justify-between">
          <p className="font-semibold text-white">Dados do documento</p>
          <p className="text-sm text-white/50">
            <span className="font-bold text-ouro-200">{feitos}</span> de {preenchiveis.length}
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-ouro-300 to-ouro-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar campo"
            className="h-9 min-w-0 flex-1 rounded-full border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-ouro-400/60 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <button
            onClick={() => setSoPendentes((s) => !s)}
            className={`rounded-full px-3 text-xs font-semibold ${soPendentes ? "bg-white text-noite-950" : "border border-white/10 text-white/60"}`}
          >
            Pendentes
          </button>
        </div>
        {feitos < preenchiveis.length && (
          <button onClick={proximoPendente} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-ouro-400/15 py-2 text-sm font-semibold text-ouro-200 hover:bg-ouro-400/25">
            Próximo campo pendente <Icone nome="seta" className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-5 sem-barra">
        {notas.length > 0 && !q && !soPendentes && (
          <div className="rounded-2xl border border-ouro-400/25 bg-ouro-400/[0.07] p-3">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ouro-300">
              <Icone nome="alerta" className="h-3.5 w-3.5" /> Orientações do modelo
            </p>
            <ul className="mt-2 space-y-2">
              {notas.map(([k, d]) => (
                <li
                  key={k}
                  ref={(el) => {
                    refs.current[k] = el;
                  }}
                  tabIndex={-1}
                  className={`rounded-lg px-2 py-1.5 text-[13px] leading-snug text-ouro-50/85 outline-none ${foco === k ? "bg-ouro-400/20" : ""}`}
                >
                  {d.rotulo}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-ouro-200/60">As notas não saem no documento final.</p>
          </div>
        )}

        {grupos
          .filter((g) => g !== "Notas")
          .map((g) => {
            const itens = preenchiveis.filter(([k, d]) => d.grupo === g && visivel(k, d));
            if (!itens.length) return null;
            return (
              <section key={g}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">{g}</p>
                <div className="space-y-2.5">
                  {itens.map(([k, d]) => {
                    const valor = valores[k] ?? "";
                    const comum = {
                      id: `campo-${k}`,
                      value: valor,
                      onFocus: () => aoFocar(k),
                      className: `w-full rounded-xl border bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/25 focus:bg-white/[0.07] focus-visible:ring-0 focus-visible:ring-offset-0 ${
                        foco === k ? "border-ouro-400/70" : valor ? "border-white/10" : "border-ouro-400/25"
                      }`,
                    };
                    const opcoes = d.tipo === "opcao" ? d.opcoes ?? [] : /estado.?civil/i.test(k) ? ESTADOS_CIVIS : null;
                    return (
                      <label key={k} htmlFor={`campo-${k}`} className="block">
                        <span className="mb-1 flex items-center justify-between gap-2 text-xs">
                          <span className="font-medium text-white/75">{d.rotulo}</span>
                          {valor ? <Icone nome="check" className="h-3.5 w-3.5 text-mata-300" /> : null}
                        </span>
                        {d.tipo === "texto_longo" ? (
                          <textarea
                            {...comum}
                            ref={(el) => {
                              refs.current[k] = el;
                            }}
                            rows={3}
                            placeholder={d.dica}
                            onChange={(e) => aoMudar(k, e.target.value)}
                          />
                        ) : (
                          <input
                            {...comum}
                            ref={(el) => {
                              refs.current[k] = el;
                            }}
                            type={d.tipo === "data" ? "date" : d.tipo === "email" ? "email" : "text"}
                            inputMode={["numero", "moeda", "area", "cpf", "cnpj", "cep", "telefone"].includes(d.tipo) ? "decimal" : undefined}
                            list={opcoes ? `opcoes-${k}` : undefined}
                            placeholder={d.dica || (d.tipo === "moeda" ? "Ex.: 1.500,00" : d.tipo === "area" ? "Ex.: 120,5" : "")}
                            onChange={(e) => aoMudar(k, mascara(d.tipo, e.target.value))}
                          />
                        )}
                        {opcoes && (
                          <datalist id={`opcoes-${k}`}>
                            {opcoes.map((o) => (
                              <option key={o} value={o} />
                            ))}
                          </datalist>
                        )}
                        {d.dica && d.tipo !== "texto_longo" && (valor || d.tipo === "data") && <span className="mt-1 block text-[11px] text-white/35">{d.dica}</span>}
                      </label>
                    );
                  })}
                </div>
              </section>
            );
          })}
      </div>
    </div>
  );
}

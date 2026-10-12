"use client";

import Link from "next/link";
import { useState } from "react";
import Icone from "./Icone";

export function Abas({ ativa }: { ativa: "entrar" | "cadastro" }) {
  const classe = (sel: boolean) =>
    `flex-1 rounded-full py-2.5 text-center text-sm font-semibold transition ${
      sel ? "bg-white text-noite-950 shadow" : "text-white/50 hover:text-white"
    }`;
  return (
    <div className="mb-7 flex gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
      <Link href="/entrar" className={classe(ativa === "entrar")}>
        Entrar
      </Link>
      <Link href="/cadastro" className={classe(ativa === "cadastro")}>
        Criar conta
      </Link>
    </div>
  );
}

export function Campo({
  rotulo,
  tipo = "text",
  ...props
}: { rotulo: string; tipo?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [ver, setVer] = useState(false);
  const senha = tipo === "password";
  return (
    <label className="block">
      <span className="sr-only">{rotulo}</span>
      <span className="relative block">
        <input
          {...props}
          type={senha && ver ? "text" : tipo}
          placeholder={rotulo}
          className={`h-14 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-5 ${senha ? "pr-24" : ""} text-[15px] text-white outline-none transition placeholder:text-white/40 focus:border-ouro-400/60 focus:bg-white/[0.07] focus-visible:ring-0 focus-visible:ring-offset-0`}
        />
        {senha && (
          <button
            type="button"
            onClick={() => setVer((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/45 hover:text-white"
          >
            {ver ? "Ocultar" : "Mostrar"}
          </button>
        )}
      </span>
    </label>
  );
}

export function Botao({ carregando, children }: { carregando: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={carregando}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-ouro-300 to-ouro-500 text-[15px] font-bold text-noite-950 shadow-ouro transition hover:from-ouro-200 disabled:opacity-60"
    >
      {carregando && <span className="h-4 w-4 animate-spin rounded-full border-2 border-noite-950/30 border-t-noite-950" />}
      {children}
    </button>
  );
}

export function Aviso({ tipo, children }: { tipo: "erro" | "ok"; children: React.ReactNode }) {
  return (
    <div
      role={tipo === "erro" ? "alert" : "status"}
      className={`flex gap-3 rounded-2xl border p-4 text-sm leading-relaxed ${
        tipo === "erro" ? "border-red-400/30 bg-red-500/10 text-red-100" : "border-mata-400/30 bg-mata-500/15 text-mata-100"
      }`}
    >
      <Icone nome={tipo === "erro" ? "alerta" : "check"} className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function traduzirErro(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Este e-mail já tem conta. Use “Entrar” ou “Esqueci minha senha”.";
  if (m.includes("password should be") || m.includes("weak password")) return "Escolha uma senha mais forte (mínimo de 8 caracteres).";
  if (m.includes("rate limit") || m.includes("too many")) return "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.";
  if (m.includes("database error saving new user") || m.includes("não liberado"))
    return "Este e-mail ainda não está liberado na plataforma.";
  if (m.includes("same password")) return "A nova senha precisa ser diferente da anterior.";
  if (m.includes("fetch")) return "Sem conexão com o servidor. Verifique sua internet.";
  return "Não foi possível concluir. Tente de novo em instantes.";
}

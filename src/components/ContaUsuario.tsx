"use client";

import Link from "next/link";
import { useConta } from "@/lib/conta";
import { limparEstadoLocal } from "@/lib/estado";
import { supabaseNavegador } from "@/lib/supabase/cliente";
import Icone from "./Icone";

export async function sair() {
  limparEstadoLocal();
  try {
    sessionStorage.removeItem("rr-acesso-registrado");
  } catch {}
  await supabaseNavegador().auth.signOut();
  window.location.href = "/entrar";
}

/** Bloco da conta: nome, links de administração e botão de sair. */
export default function ContaUsuario({ variante = "lateral" }: { variante?: "lateral" | "cartao" }) {
  const conta = useConta();
  if (!conta) return variante === "cartao" ? null : <div className="h-11" />;
  const inicial = (conta.nome || conta.email).trim().charAt(0).toUpperCase();

  if (variante === "cartao") {
    return (
      <div className="vidro flex flex-wrap items-center gap-4 p-5">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-b from-ouro-300 to-ouro-500 font-display text-lg font-bold text-noite-950">
          {inicial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-white">{conta.nome}</span>
          <span className="block truncate text-sm text-white/45">{conta.email}</span>
        </span>
        <span className="flex flex-wrap gap-2">
          {conta.papel === "admin" && (
            <Link href="/admin" className="botao-fantasma">
              <Icone nome="escudo" className="h-4 w-4" />
              Administração
            </Link>
          )}
          <button onClick={sair} className="botao-fantasma">
            Sair
          </button>
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conta.papel === "admin" && (
        <>
          <Link href="/admin" className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-white/50 transition hover:text-white">
            <Icone nome="escudo" className="h-3.5 w-3.5" />
            Alunos e acessos
          </Link>
          <Link href="/revisao" className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-white/50 transition hover:text-white">
            <Icone nome="livro" className="h-3.5 w-3.5" />
            Painel de revisão
          </Link>
        </>
      )}
      <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-b from-ouro-300 to-ouro-500 text-sm font-bold text-noite-950">
          {inicial}
        </span>
        <span className="min-w-0 flex-1 text-xs leading-tight">
          <span className="block truncate font-semibold text-white">{conta.nome}</span>
          <span className="block truncate text-white/40">{conta.email}</span>
        </span>
        <button onClick={sair} className="rounded-lg px-2 py-1 text-xs text-white/45 transition hover:bg-white/[0.06] hover:text-white">
          Sair
        </button>
      </div>
    </div>
  );
}

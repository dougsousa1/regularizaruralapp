"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import type { MetadadosAcesso } from "./supabase/config";
import { supabaseNavegador } from "./supabase/cliente";

export type Conta = { id: string; email: string; nome: string; papel: "aluno" | "admin" };

/** Usuário logado neste navegador (null enquanto carrega ou se não houver sessão). */
export function useConta(): Conta | null {
  const [conta, setConta] = useState<Conta | null>(null);
  useEffect(() => {
    const supabase = supabaseNavegador();
    const ler = (user: User | null) =>
      setConta(
        user
          ? {
              id: user.id,
              email: user.email ?? "",
              nome: (user.user_metadata?.nome as string | undefined) || (user.email ?? "").split("@")[0],
              papel: (user.app_metadata as MetadadosAcesso)?.papel === "admin" ? "admin" : "aluno",
            }
          : null,
      );
    supabase.auth.getSession().then(({ data }) => ler(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, sessao) => ler(sessao?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  return conta;
}

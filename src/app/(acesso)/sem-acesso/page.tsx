"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Aviso } from "@/components/Formulario";
import { limparEstadoLocal } from "@/lib/estado";
import { supabaseNavegador } from "@/lib/supabase/cliente";

export default function Pagina() {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [carregando, setCarregando] = useState(false);

  return (
    <div className="space-y-4 text-center">
      <p className="titulo-display text-xl">Acesso não liberado</p>
      <p className="text-sm leading-relaxed text-white/60">
        Sua conta existe, mas o acesso à central não está liberado no momento. Se você acabou de se inscrever ou
        renovou, clique em “Verificar de novo”. Se continuar assim, fale com o suporte da mentoria.
      </p>
      {msg && <Aviso tipo="erro">{msg}</Aviso>}
      <button
        disabled={carregando}
        onClick={async () => {
          setCarregando(true);
          setMsg("");
          const supabase = supabaseNavegador();
          const { data } = await supabase.auth.refreshSession();
          const acesso = (data.user?.app_metadata as { acesso?: string } | undefined)?.acesso;
          if (acesso === "liberado") {
            router.replace("/");
            router.refresh();
          } else {
            setMsg("Ainda não liberado.");
            setCarregando(false);
          }
        }}
        className="flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-b from-ouro-300 to-ouro-500 font-bold text-noite-950 shadow-ouro disabled:opacity-60"
      >
        Verificar de novo
      </button>
      <button
        onClick={async () => {
          limparEstadoLocal();
          await supabaseNavegador().auth.signOut();
          window.location.href = "/entrar";
        }}
        className="text-sm text-white/55 hover:text-white"
      >
        Sair desta conta
      </button>
    </div>
  );
}

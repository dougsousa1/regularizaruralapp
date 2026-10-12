"use client";

import Link from "next/link";
import { useState } from "react";
import { Aviso, Botao, Campo, traduzirErro } from "@/components/Formulario";
import { supabaseNavegador } from "@/lib/supabase/cliente";

export default function Pagina() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setErro("");
        setCarregando(true);
        const { error } = await supabaseNavegador().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
          redirectTo: `${window.location.origin}/auth/confirmar?proximo=/nova-senha`,
        });
        setCarregando(false);
        if (error) setErro(traduzirErro(error.message));
        else setEnviado(true);
      }}
      className="space-y-3"
    >
      <p className="titulo-display text-center text-xl">Recuperar senha</p>
      <p className="pb-3 text-center text-sm text-white/60">
        Informe seu e-mail. Se ele tiver conta, enviaremos um link para criar uma nova senha.
      </p>
      {enviado ? (
        <Aviso tipo="ok">Pronto! Se houver uma conta com esse e-mail, o link chega em alguns minutos. Confira também o spam.</Aviso>
      ) : (
        <>
          <Campo rotulo="E-mail" tipo="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="pt-2" />
          {erro && <Aviso tipo="erro">{erro}</Aviso>}
          <Botao carregando={carregando}>Enviar link</Botao>
        </>
      )}
      <p className="pt-3 text-center text-sm">
        <Link href="/entrar" className="text-white/55 hover:text-white">
          ← Voltar para o login
        </Link>
      </p>
    </form>
  );
}

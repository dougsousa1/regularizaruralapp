"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Abas, Aviso, Botao, Campo, traduzirErro } from "@/components/Formulario";
import { supabaseNavegador } from "@/lib/supabase/cliente";

export default function FormEntrar() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(params.get("erro") === "link" ? "O link expirou ou já foi usado. Faça login ou peça um novo." : "");
  const [carregando, setCarregando] = useState(false);
  const proximo = params.get("proximo");
  const destino = proximo && proximo.startsWith("/") && !proximo.startsWith("//") ? proximo : "/";

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setErro("");
        setCarregando(true);
        const { error } = await supabaseNavegador().auth.signInWithPassword({ email: email.trim(), password: senha });
        if (error) {
          setErro(traduzirErro(error.message));
          setCarregando(false);
          return;
        }
        router.replace(destino);
        router.refresh();
      }}
      className="space-y-3"
    >
      <Abas ativa="entrar" />
      <p className="pb-2 text-center text-sm text-white/60">Insira seus dados para acessar a central de consulta.</p>
      <Campo rotulo="E-mail" tipo="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <Campo rotulo="Senha" tipo="password" autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
      <div className="flex justify-end pb-2">
        <Link href="/recuperar-senha" className="text-sm text-white/55 hover:text-white">
          Esqueceu sua senha?
        </Link>
      </div>
      {erro && <Aviso tipo="erro">{erro}</Aviso>}
      <Botao carregando={carregando}>Entrar</Botao>
    </form>
  );
}

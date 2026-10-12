"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Aviso, Botao, Campo, traduzirErro } from "@/components/Formulario";
import { supabaseNavegador } from "@/lib/supabase/cliente";

export default function Pagina() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setErro("");
        if (senha.length < 8) return setErro("A senha precisa ter pelo menos 8 caracteres.");
        if (senha !== confirma) return setErro("As senhas não conferem.");
        setCarregando(true);
        const { error } = await supabaseNavegador().auth.updateUser({ password: senha });
        if (error) {
          setErro(traduzirErro(error.message));
          setCarregando(false);
          return;
        }
        router.replace("/");
        router.refresh();
      }}
      className="space-y-3"
    >
      <p className="titulo-display text-center text-xl">Crie sua nova senha</p>
      <p className="pb-3 text-center text-sm text-white/60">Escolha uma senha com pelo menos 8 caracteres.</p>
      <Campo rotulo="Nova senha" tipo="password" autoComplete="new-password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
      <Campo rotulo="Repita a nova senha" tipo="password" autoComplete="new-password" required value={confirma} onChange={(e) => setConfirma(e.target.value)} />
      <div className="pt-2" />
      {erro && <Aviso tipo="erro">{erro}</Aviso>}
      <Botao carregando={carregando}>Salvar e entrar</Botao>
    </form>
  );
}

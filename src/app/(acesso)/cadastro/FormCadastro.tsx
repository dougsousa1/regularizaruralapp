"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Abas, Aviso, Botao, Campo, traduzirErro } from "@/components/Formulario";
import { supabaseNavegador } from "@/lib/supabase/cliente";

export default function FormCadastro() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  if (enviado) {
    return (
      <div className="space-y-4 text-center">
        <Abas ativa="cadastro" />
        <p className="titulo-display text-xl">Confirme seu e-mail</p>
        <p className="text-sm leading-relaxed text-white/60">
          Enviamos um link de confirmação para <strong className="text-white">{email.trim()}</strong>. Abra o e-mail
          (confira também o spam) e clique no link para ativar sua conta.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setErro("");
        if (senha.length < 8) return setErro("A senha precisa ter pelo menos 8 caracteres.");
        if (senha !== confirma) return setErro("As senhas não conferem.");
        setCarregando(true);
        const supabase = supabaseNavegador();
        const limpo = email.trim().toLowerCase();
        const { data: liberado, error: erroConsulta } = await supabase.rpc("pode_cadastrar", { p_email: limpo });
        if (erroConsulta) {
          setErro(traduzirErro(erroConsulta.message));
          setCarregando(false);
          return;
        }
        if (!liberado) {
          setErro("Este e-mail ainda não está liberado. Use o mesmo e-mail da sua inscrição ou fale com o suporte da mentoria.");
          setCarregando(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: limpo,
          password: senha,
          options: { data: { nome: nome.trim() }, emailRedirectTo: `${window.location.origin}/auth/confirmar` },
        });
        if (error) {
          setErro(traduzirErro(error.message));
          setCarregando(false);
          return;
        }
        if (data.session) {
          router.replace("/");
          router.refresh();
        } else {
          setEnviado(true);
        }
      }}
      className="space-y-3"
    >
      <Abas ativa="cadastro" />
      <p className="pb-2 text-center text-sm text-white/60">Use o mesmo e-mail da sua inscrição na mentoria. A senha precisa ter pelo menos 8 caracteres.</p>
      <Campo rotulo="Seu nome" autoComplete="name" required value={nome} onChange={(e) => setNome(e.target.value)} />
      <Campo rotulo="E-mail" tipo="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <Campo rotulo="Crie uma senha" tipo="password" autoComplete="new-password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
      <Campo rotulo="Repita a senha" tipo="password" autoComplete="new-password" required value={confirma} onChange={(e) => setConfirma(e.target.value)} />
      <div className="pt-2" />
      {erro && <Aviso tipo="erro">{erro}</Aviso>}
      <Botao carregando={carregando}>Criar conta</Botao>
    </form>
  );
}

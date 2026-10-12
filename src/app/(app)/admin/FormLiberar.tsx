"use client";

import { useActionState } from "react";
import { liberarEmails, type Resultado } from "./acoes";

export default function FormLiberar() {
  const [resultado, acao, enviando] = useActionState<Resultado | null, FormData>(liberarEmails, null);
  return (
    <form action={acao} className="vidro h-fit space-y-4 p-5 sm:p-6">
      <div>
        <p className="titulo-display text-lg">Liberar acesso</p>
        <p className="mt-1 text-sm text-white/50">
          Cole um e-mail por linha. Pode incluir o nome na mesma linha (ex.: <em>Maria Silva, maria@email.com</em>).
        </p>
      </div>
      <textarea
        name="lista"
        required
        rows={8}
        placeholder={"maria@email.com\nJoão Souza, joao@email.com"}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-ouro-400/60 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <label className="flex items-center gap-2 text-sm text-white/70">
        <select name="papel" className="rounded-full border border-white/10 bg-noite-800 px-3 py-1.5 text-white">
          <option value="aluno">como aluno</option>
          <option value="admin">como administrador</option>
        </select>
      </label>
      {resultado && (
        <p className={`rounded-xl px-3 py-2 text-sm ${resultado.ok ? "bg-mata-500/15 text-mata-100" : "bg-red-500/10 text-red-200"}`}>
          {resultado.mensagem}
        </p>
      )}
      <button disabled={enviando} className="botao-ouro w-full disabled:opacity-60">
        {enviando ? "Liberando…" : "Liberar e-mails"}
      </button>
    </form>
  );
}

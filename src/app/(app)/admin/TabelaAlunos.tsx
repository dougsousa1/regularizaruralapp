"use client";

import { useMemo, useState, useTransition } from "react";
import { alterarAcesso, removerAcesso } from "./acoes";

export type LinhaAluno = {
  email: string;
  nome: string;
  papel: string;
  status: string;
  cadastrado: boolean;
  ultimoAcesso: string | null;
  concluidos: number;
  salvos: number;
};

function quando(data: string | null) {
  if (!data) return "—";
  const dias = Math.floor((Date.now() - new Date(data).getTime()) / 864e5);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 30) return `há ${dias} dias`;
  return new Date(data).toLocaleDateString("pt-BR");
}

export default function TabelaAlunos({ linhas, totalEstudo }: { linhas: LinhaAluno[]; totalEstudo: number }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "sem-conta" | "bloqueados">("todos");
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState("");

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return linhas.filter(
      (l) =>
        (!q || l.email.includes(q) || l.nome.toLowerCase().includes(q)) &&
        (filtro === "todos" || (filtro === "sem-conta" ? !l.cadastrado : l.status === "bloqueado")),
    );
  }, [linhas, busca, filtro]);

  const executar = (fn: () => Promise<void>) =>
    iniciar(async () => {
      setErro("");
      try {
        await fn();
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao salvar.");
      }
    });

  return (
    <div className={`vidro overflow-hidden ${pendente ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] p-4">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou e-mail"
          className="h-10 min-w-[12rem] flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-ouro-400/60 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {(["todos", "sem-conta", "bloqueados"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filtro === f ? "bg-white text-noite-950" : "text-white/55 hover:text-white"}`}
          >
            {f === "todos" ? `Todos (${linhas.length})` : f === "sem-conta" ? "Sem conta" : "Bloqueados"}
          </button>
        ))}
      </div>
      {erro && <p className="bg-red-500/10 px-4 py-2 text-sm text-red-200">{erro}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wider text-white/40">
            <tr>
              <th className="px-4 py-3 font-semibold">Aluno</th>
              <th className="px-4 py-3 font-semibold">Situação</th>
              <th className="px-4 py-3 font-semibold">Último acesso</th>
              <th className="px-4 py-3 font-semibold">Progresso</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {visiveis.map((l) => (
              <tr key={l.email} className="border-t border-white/[0.05] align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold text-white">{l.nome || "—"}</p>
                  <p className="text-xs text-white/45">{l.email}</p>
                  {l.papel === "admin" && <span className="chip mt-1 border-ouro-400/30 text-ouro-200">admin</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`chip ${l.status === "bloqueado" ? "border-red-400/30 text-red-200" : l.cadastrado ? "border-mata-400/30 text-mata-200" : ""}`}>
                    {l.status === "bloqueado" ? "Bloqueado" : l.cadastrado ? "Ativo" : "Aguardando cadastro"}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/60">{quando(l.ultimoAcesso)}</td>
                <td className="px-4 py-3 text-white/60">
                  {l.cadastrado ? `${l.concluidos}/${totalEstudo} concluídos · ${l.salvos} salvos` : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <button
                      onClick={() => executar(() => alterarAcesso(l.email, { status: l.status === "bloqueado" ? "liberado" : "bloqueado" }))}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70 hover:border-white/30 hover:text-white"
                    >
                      {l.status === "bloqueado" ? "Liberar" : "Bloquear"}
                    </button>
                    <button
                      onClick={() => executar(() => alterarAcesso(l.email, { papel: l.papel === "admin" ? "aluno" : "admin" }))}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70 hover:border-white/30 hover:text-white"
                    >
                      {l.papel === "admin" ? "Tirar admin" : "Tornar admin"}
                    </button>
                    <button
                      onClick={() =>
                        confirm(`Remover ${l.email} da lista? A pessoa perde o acesso.`) && executar(() => removerAcesso(l.email))
                      }
                      className="rounded-full border border-red-400/20 px-3 py-1 text-xs text-red-200/80 hover:border-red-400/50"
                    >
                      Remover
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!visiveis.length && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-white/45">
                  Nenhum aluno encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="border-t border-white/[0.06] px-4 py-3 text-xs text-white/35">
        Bloqueios e liberações valem para quem está logado em até 1 hora (quando o login se renova).
      </p>
    </div>
  );
}

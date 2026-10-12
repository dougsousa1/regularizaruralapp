import { redirect } from "next/navigation";
import { Trilha } from "@/components/Cartoes";
import Icone from "@/components/Icone";
import { todosItens } from "@/lib/conteudo";
import { supabaseServidor } from "@/lib/supabase/servidor";
import FormLiberar from "./FormLiberar";
import TabelaAlunos, { type LinhaAluno } from "./TabelaAlunos";

export const metadata = { title: "Administração" };
export const dynamic = "force-dynamic";

export default async function PaginaAdmin() {
  const supabase = await supabaseServidor();
  const { data: admin } = await supabase.rpc("e_admin");
  if (!admin) redirect("/");

  const [{ data: acessos }, { data: perfis }, { data: progresso }] = await Promise.all([
    supabase.from("acessos").select("email, nome, papel, status, origem, criado_em").order("criado_em", { ascending: false }),
    supabase.from("perfis").select("id, email, nome, criado_em, ultimo_acesso"),
    supabase.from("progresso").select("usuario_id, concluidos, favoritos, atualizado_em"),
  ]);

  const progressoPorId = new Map((progresso ?? []).map((p) => [p.usuario_id, p]));
  const perfilPorEmail = new Map((perfis ?? []).map((p) => [p.email, p]));
  const totalEstudo = todosItens().filter((i) => i.tipo === "guia" || i.tipo === "referencia").length;

  const linhas: LinhaAluno[] = (acessos ?? []).map((a) => {
    const perfil = perfilPorEmail.get(a.email);
    const prog = perfil ? progressoPorId.get(perfil.id) : undefined;
    return {
      email: a.email,
      nome: perfil?.nome || a.nome || "",
      papel: a.papel,
      status: a.status,
      cadastrado: !!perfil,
      ultimoAcesso: perfil?.ultimo_acesso ?? null,
      concluidos: prog?.concluidos?.length ?? 0,
      salvos: prog?.favoritos?.length ?? 0,
    };
  });

  const seteDias = Date.now() - 7 * 864e5;
  const numeros = [
    { rotulo: "E-mails liberados", valor: linhas.filter((l) => l.status === "liberado").length, icone: "escudo" },
    { rotulo: "Contas criadas", valor: linhas.filter((l) => l.cadastrado).length, icone: "check" },
    {
      rotulo: "Ativos nos últimos 7 dias",
      valor: linhas.filter((l) => l.ultimoAcesso && new Date(l.ultimoAcesso).getTime() > seteDias).length,
      icone: "raio",
    },
    { rotulo: "Bloqueados", valor: linhas.filter((l) => l.status === "bloqueado").length, icone: "alerta" },
  ];

  return (
    <div className="container-site pt-2 lg:pt-0">
      <Trilha partes={[{ rotulo: "Administração" }]} />
      <p className="rotulo">Painel da mentoria</p>
      <h1 className="titulo-display mt-2 text-3xl sm:text-4xl">Alunos e acessos</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-white/55">
        Só quem estiver na lista abaixo, com acesso liberado, consegue criar conta e usar a central.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {numeros.map((n) => (
          <div key={n.rotulo} className="vidro p-5">
            <Icone nome={n.icone} className="h-5 w-5 text-ouro-300" />
            <p className="mt-3 font-display text-3xl font-bold text-white">{n.valor}</p>
            <p className="text-xs text-white/45">{n.rotulo}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <FormLiberar />
        <TabelaAlunos linhas={linhas} totalEstudo={totalEstudo} />
      </div>
    </div>
  );
}

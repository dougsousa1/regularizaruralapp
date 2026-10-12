import Link from "next/link";
import { Trilha } from "@/components/Cartoes";
import Icone from "@/components/Icone";
import ListaConteudos from "@/components/admin/ListaConteudos";
import { todosItens, todosPilares } from "@/lib/conteudo";
import AbasAdmin from "../AbasAdmin";
import { paginaAdmin } from "../exigir-admin";

export const metadata = { title: "Conteúdos · Administração" };
export const dynamic = "force-dynamic";

export default async function Pagina() {
  const supabase = await paginaAdmin();
  const [itens, pilares, { data: excluidos }] = await Promise.all([
    todosItens(),
    todosPilares(),
    supabase.from("conteudos").select("id, titulo, tipo, pilar, atualizado_em").eq("excluido", true).order("atualizado_em", { ascending: false }),
  ]);
  return (
    <div className="container-site pt-2 lg:pt-0">
      <Trilha partes={[{ href: "/admin", rotulo: "Administração" }, { rotulo: "Conteúdos" }]} />
      <AbasAdmin />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="rotulo">Painel da mentoria</p>
          <h1 className="titulo-display mt-2 text-3xl sm:text-4xl">Conteúdos</h1>
          <p className="mt-2 max-w-2xl text-[15px] text-white/55">
            Edite qualquer guia, checklist ou tabela, ou crie um novo. Ao salvar, a mudança aparece para os alunos em segundos.
          </p>
        </div>
        <Link href="/admin/conteudos/novo" className="botao-ouro self-start sm:self-auto">
          <Icone nome="mais" className="h-4 w-4" />
          Novo conteúdo
        </Link>
      </div>
      <ListaConteudos
        itens={itens.map((i) => ({ id: i.id, titulo: i.titulo, tipo: i.tipo, pilar: i.pilar, revisao: i.revisao, origem: i.origem, atualizadoEm: i.atualizadoEm ?? null }))}
        pilares={pilares.map((p) => ({ slug: p.slug, nome: p.nome }))}
        excluidos={excluidos ?? []}
      />
    </div>
  );
}

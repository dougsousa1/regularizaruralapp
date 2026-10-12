import { notFound } from "next/navigation";
import { Trilha } from "@/components/Cartoes";
import EditorConteudo from "@/components/admin/EditorConteudo";
import { getItem, todosItens, todosPilares } from "@/lib/conteudo";
import AbasAdmin from "../../AbasAdmin";
import { paginaAdmin } from "../../exigir-admin";

export const metadata = { title: "Editar conteúdo · Administração" };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function Pagina({ params }: Props) {
  const { id } = await params;
  const supabase = await paginaAdmin();
  const [item, itens, pilares, { data: versoes }] = await Promise.all([
    getItem(id),
    todosItens(),
    todosPilares(),
    supabase.from("conteudos_versoes").select("id, criado_em, dados->>titulo").eq("conteudo_id", id).order("criado_em", { ascending: false }).limit(30),
  ]);
  if (!item) notFound();
  return (
    <div className="container-site pt-2 lg:pt-0">
      <Trilha partes={[{ href: "/admin", rotulo: "Administração" }, { href: "/admin/conteudos", rotulo: "Conteúdos" }, { rotulo: item.titulo }]} />
      <AbasAdmin />
      <EditorConteudo
        key={item.id + (item.atualizadoEm ?? "")}
        inicial={{
          id: item.id,
          pilar: item.pilar,
          tipo: item.tipo,
          titulo: item.titulo,
          resumo: item.resumo,
          tags: item.tags,
          baseLegal: item.baseLegal,
          relacionados: item.relacionados,
          fonte: item.fonte,
          revisao: item.revisao,
          corpo: item.corpo,
          origem: item.origem,
        }}
        pilares={pilares.map((p) => ({ slug: p.slug, nome: p.nome }))}
        opcoes={itens.map((i) => ({ id: i.id, titulo: i.titulo, tipo: i.tipo, pilar: i.pilar }))}
        versoes={(versoes ?? []).map((v) => ({ id: v.id, criado_em: v.criado_em, titulo: (v as { titulo?: string }).titulo ?? "" }))}
      />
    </div>
  );
}

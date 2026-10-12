import { Trilha } from "@/components/Cartoes";
import EditorConteudo from "@/components/admin/EditorConteudo";
import { todosItens, todosPilares } from "@/lib/conteudo";
import type { Tipo } from "@/lib/pilares";
import AbasAdmin from "../../AbasAdmin";
import { paginaAdmin } from "../../exigir-admin";

export const metadata = { title: "Novo conteúdo · Administração" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ pilar?: string; tipo?: string }> };

export default async function Pagina({ searchParams }: Props) {
  await paginaAdmin();
  const q = await searchParams;
  const [itens, pilares] = await Promise.all([todosItens(), todosPilares()]);
  const tipo: Tipo = q.tipo === "checklist" || q.tipo === "referencia" ? q.tipo : "guia";
  const pilar = pilares.find((p) => p.slug === q.pilar)?.slug ?? pilares[0]?.slug ?? "";
  return (
    <div className="container-site pt-2 lg:pt-0">
      <Trilha partes={[{ href: "/admin", rotulo: "Administração" }, { href: "/admin/conteudos", rotulo: "Conteúdos" }, { rotulo: "Novo" }]} />
      <AbasAdmin />
      <EditorConteudo
        inicial={{ pilar, tipo, titulo: "", resumo: "", tags: [], baseLegal: [], relacionados: [], fonte: "", revisao: "revisado", corpo: "" }}
        pilares={pilares.map((p) => ({ slug: p.slug, nome: p.nome }))}
        opcoes={itens.map((i) => ({ id: i.id, titulo: i.titulo, tipo: i.tipo, pilar: i.pilar }))}
        versoes={[]}
      />
    </div>
  );
}

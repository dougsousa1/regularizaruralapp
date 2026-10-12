import type { Metadata } from "next";
import { Cabecalho, cabecalhoItem, Lateral, Tags } from "@/components/Artigo";
import ChecklistInterativo from "@/components/ChecklistInterativo";
import { estruturarChecklist, getItem, itensDoTipo } from "@/lib/conteudo";

type Props = { params: Promise<{ id: string }> };

// Conteúdos criados no painel são gerados na primeira visita.
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await itensDoTipo("checklist")).map((i) => ({ id: i.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await getItem(id);
  return { title: item?.titulo, description: item?.resumo };
}

export default async function PaginaChecklist({ params }: Props) {
  const { id } = await params;
  const { item } = await cabecalhoItem(id, "checklist");
  return (
    <div className="container-site pt-2 lg:pt-0">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_17rem] xl:gap-10">
        <article className="min-w-0">
          <Cabecalho id={id} tipo="checklist" concluivel={false} />
          <div className="mt-8">
            <ChecklistInterativo id={item.id} titulo={item.titulo} secoes={estruturarChecklist(item)} />
          </div>
          <Tags id={id} />
        </article>
        <Lateral id={id} />
      </div>
    </div>
  );
}

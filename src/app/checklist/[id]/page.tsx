import type { Metadata } from "next";
import { Cabecalho, cabecalhoItem, Lateral, Tags } from "@/components/Artigo";
import ChecklistInterativo from "@/components/ChecklistInterativo";
import { estruturarChecklist, getItem, itensDoTipo } from "@/lib/conteudo";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return itensDoTipo("checklist").map((i) => ({ id: i.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = getItem(id);
  return { title: item?.titulo, description: item?.resumo };
}

export default async function PaginaChecklist({ params }: Props) {
  const { id } = await params;
  const { item } = cabecalhoItem(id, "checklist");
  return (
    <div className="container-site py-8">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article className="min-w-0">
          <Cabecalho id={id} tipo="checklist" acoes={false} />
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

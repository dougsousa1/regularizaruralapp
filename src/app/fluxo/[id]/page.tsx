import type { Metadata } from "next";
import { Cabecalho, cabecalhoItem, Lateral } from "@/components/Artigo";
import FluxoInterativo, { type LinkResolvido } from "@/components/FluxoInterativo";
import { getItem, itensDoTipo, rota } from "@/lib/conteudo";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return itensDoTipo("fluxo").map((i) => ({ id: i.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = getItem(id);
  return { title: item?.titulo, description: item?.resumo };
}

export default async function PaginaFluxo({ params }: Props) {
  const { id } = await params;
  const { item } = cabecalhoItem(id, "fluxo");
  const fluxo = item.fluxo!;
  const links: Record<string, LinkResolvido> = {};
  for (const r of Object.values(fluxo.resultados)) {
    for (const l of r.links ?? []) {
      const alvo = getItem(l);
      if (alvo) links[l] = { id: alvo.id, titulo: alvo.titulo, rota: rota(alvo), tipo: alvo.tipo };
    }
  }
  return (
    <div className="container-site py-8">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article className="min-w-0 max-w-3xl">
          <Cabecalho id={id} tipo="fluxo" acoes={false} />
          <div className="mt-8">
            <FluxoInterativo titulo={item.titulo} fluxo={fluxo} links={links} />
          </div>
        </article>
        <Lateral id={id} />
      </div>
    </div>
  );
}

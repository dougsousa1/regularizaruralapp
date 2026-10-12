import type { Metadata } from "next";
import { Cabecalho, cabecalhoItem, Lateral } from "@/components/Artigo";
import FluxoInterativo, { type LinkResolvido } from "@/components/FluxoInterativo";
import { getItem, itensDoTipo, rota } from "@/lib/conteudo";

type Props = { params: Promise<{ id: string }> };

// Conteúdos criados no painel são gerados na primeira visita.
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await itensDoTipo("fluxo")).map((i) => ({ id: i.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await getItem(id);
  return { title: item?.titulo, description: item?.resumo };
}

export default async function PaginaFluxo({ params }: Props) {
  const { id } = await params;
  const { item } = await cabecalhoItem(id, "fluxo");
  const fluxo = item.fluxo!;
  const links: Record<string, LinkResolvido> = {};
  for (const r of Object.values(fluxo.resultados)) {
    for (const l of r.links ?? []) {
      const alvo = await getItem(l);
      if (alvo) links[l] = { id: alvo.id, titulo: alvo.titulo, rota: rota(alvo), tipo: alvo.tipo };
    }
  }
  return (
    <div className="container-site pt-2 lg:pt-0">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_17rem] xl:gap-10">
        <article className="min-w-0 max-w-3xl">
          <Cabecalho id={id} tipo="fluxo" concluivel={false} />
          <div className="mt-8">
            <FluxoInterativo titulo={item.titulo} fluxo={fluxo} links={links} />
          </div>
        </article>
        <Lateral id={id} />
      </div>
    </div>
  );
}

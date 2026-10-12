import type { Metadata } from "next";
import Artigo from "@/components/Artigo";
import { getItem, itensDoTipo } from "@/lib/conteudo";

type Props = { params: Promise<{ id: string }> };

// Conteúdos criados no painel são gerados na primeira visita.
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await itensDoTipo("referencia")).map((i) => ({ id: i.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await getItem(id);
  return { title: item?.titulo, description: item?.resumo };
}

export default async function Pagina({ params }: Props) {
  const { id } = await params;
  return <Artigo id={id} tipo="referencia" />;
}

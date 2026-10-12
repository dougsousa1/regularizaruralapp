import { notFound } from "next/navigation";
import { Trilha } from "@/components/Cartoes";
import { caminhoRevisao, renderizar, revisaoDoPilar } from "@/lib/conteudo";
import { getPilar, PILARES } from "@/lib/pilares";

type Props = { params: Promise<{ pilar: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PILARES.filter((p) => revisaoDoPilar(p.slug)).map((p) => ({ pilar: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { pilar } = await params;
  return { title: `Revisão — ${getPilar(pilar)?.nome}` };
}

export default async function Pagina({ params }: Props) {
  const { pilar: slug } = await params;
  const pilar = getPilar(slug);
  const md = revisaoDoPilar(slug);
  if (!pilar || !md) notFound();
  const { html } = renderizar(md.replace(/^\s*# .*\n/, ""), caminhoRevisao(slug));
  return (
    <div className="container-site max-w-4xl py-8">
      <Trilha partes={[{ href: "/revisao", rotulo: "Painel de revisão" }, { rotulo: pilar.nome }]} />
      <h1 className="font-serif text-3xl font-semibold text-stone-900">Pontos para revisão — {pilar.nome}</h1>
      <div className="conteudo-guia mt-8" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

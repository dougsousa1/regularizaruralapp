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
    <div className="container-site max-w-4xl pt-2 lg:pt-0">
      <Trilha partes={[{ href: "/revisao", rotulo: "Painel de revisão" }, { rotulo: pilar.nome }]} />
      <p className="rotulo">Pontos para revisão</p>
      <h1 className="titulo-display mt-2 text-3xl sm:text-4xl">{pilar.nome}</h1>
      <div className="vidro mt-8 px-5 py-2 sm:px-9 sm:py-4">
        <div className="conteudo-guia" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}

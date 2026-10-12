import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Trilha } from "@/components/Cartoes";
import Icone from "@/components/Icone";
import ListaPilar from "@/components/ListaPilar";
import { ProgressoPilar } from "@/components/Painel";
import { getItem, itensDoPilar, rota, revisaoDoPilar } from "@/lib/conteudo";
import { getPilar, PILARES, type Tipo } from "@/lib/pilares";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PILARES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: getPilar(slug)?.nome };
}

const ORDEM: Tipo[] = ["fluxo", "guia", "checklist", "referencia"];

export default async function PaginaPilar({ params }: Props) {
  const { slug } = await params;
  const pilar = getPilar(slug);
  if (!pilar) notFound();
  const numero = PILARES.findIndex((p) => p.slug === slug) + 1;
  const entrada = pilar.comeceAqui ? getItem(pilar.comeceAqui) : undefined;
  const itens = itensDoPilar(slug);
  const estudo = itens.filter((i) => i.tipo === "guia" || i.tipo === "referencia").map((i) => i.id);
  const grupos = ORDEM.map((tipo) => ({
    tipo,
    itens: itensDoPilar(slug, tipo).map((i) => ({ id: i.id, titulo: i.titulo, tipo: i.tipo, resumo: i.resumo })),
  })).filter((g) => g.itens.length);

  return (
    <div className="container-site pt-2 lg:pt-0">
      <Trilha partes={[{ href: "/pilares", rotulo: "Pilares" }, { rotulo: pilar.nome }]} />

      <section className="relative isolate overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-noite-800 via-noite-900 to-noite-950 p-6 shadow-2xl shadow-black/40 sm:p-10 animate-surgir">
        <div className="pointer-events-none absolute -right-20 -top-28 -z-10 h-80 w-80 rounded-full bg-ouro-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-10 -z-10 h-72 w-72 rounded-full bg-mata-500/15 blur-3xl" />
        <span className="pointer-events-none absolute -right-3 -top-8 -z-10 select-none font-display text-[8rem] font-bold leading-none text-white/[0.035] sm:text-[12rem] lg:right-1/3">
          {String(numero).padStart(2, "0")}
        </span>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="icone-caixa h-12 w-12">
                <Icone nome={pilar.icone} className="h-6 w-6" />
              </span>
              <p className="rotulo">Pilar {String(numero).padStart(2, "0")}</p>
            </div>
            <h1 className="titulo-display mt-5 text-3xl leading-tight sm:text-5xl">{pilar.nome}</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-white/55">{pilar.descricao}</p>
          </div>
          <div className="w-full shrink-0 lg:w-72">
            <ProgressoPilar ids={estudo} />
            <div className="mt-4 flex flex-wrap gap-2">
              {entrada && (
                <Link href={rota(entrada)} className="botao-ouro">
                  <Icone nome="livro" className="h-4 w-4" />
                  Comece por aqui
                </Link>
              )}
              {revisaoDoPilar(slug) && (
                <Link href={`/revisao/${slug}`} className="botao-fantasma">
                  <Icone nome="escudo" className="h-4 w-4" />
                  Em revisão
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8">
        <ListaPilar grupos={grupos} />
      </div>
    </div>
  );
}

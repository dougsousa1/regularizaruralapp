import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CartaoItem, Trilha } from "@/components/Cartoes";
import Icone from "@/components/Icone";
import { getItem, itensDoPilar, resumo, rota, revisaoDoPilar } from "@/lib/conteudo";
import { getPilar, PILARES, TIPOS, type Tipo } from "@/lib/pilares";

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
  const entrada = pilar.comeceAqui ? getItem(pilar.comeceAqui) : undefined;
  const temRevisao = !!revisaoDoPilar(slug);

  return (
    <div className="container-site py-8">
      <Trilha partes={[{ rotulo: pilar.nome }]} />
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-mata-700 text-white">
          <Icone nome={pilar.icone} className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-serif text-3xl font-semibold text-stone-900">{pilar.nome}</h1>
          <p className="mt-1 max-w-3xl text-stone-600">{pilar.descricao}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        {ORDEM.filter((t) => itensDoPilar(slug, t).length).map((t) => (
          <a
            key={t}
            href={`#${t}`}
            className="rounded-full border border-stone-200 bg-white px-3 py-1 text-stone-700 hover:border-mata-400"
          >
            {TIPOS[t].plural} ({itensDoPilar(slug, t).length})
          </a>
        ))}
        {temRevisao && (
          <Link
            href={`/revisao/${slug}`}
            className="rounded-full border border-terra-200 bg-terra-50 px-3 py-1 text-terra-800 hover:border-terra-400"
          >
            Pontos em revisão
          </Link>
        )}
      </div>

      {entrada && (
        <Link
          href={rota(entrada)}
          className="mt-8 flex items-center gap-4 rounded-2xl bg-mata-800 p-6 text-white transition hover:bg-mata-900"
        >
          <Icone nome="livro" className="h-8 w-8 shrink-0 text-mata-200" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-medium uppercase tracking-wider text-mata-200">Comece por aqui</span>
            <span className="block text-lg font-semibold">{entrada.titulo}</span>
            <span className="mt-1 line-clamp-2 block text-sm text-mata-100">{entrada.resumo}</span>
          </span>
          <Icone nome="seta" className="hidden h-6 w-6 shrink-0 sm:block" />
        </Link>
      )}

      {ORDEM.map((tipo) => {
        const itens = itensDoPilar(slug, tipo).filter((i) => i.id !== entrada?.id);
        if (!itens.length) return null;
        return (
          <section key={tipo} id={tipo} className="mt-10 scroll-mt-20">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-stone-900">
              <Icone nome={tipo} className="h-5 w-5 text-mata-600" />
              {TIPOS[tipo].plural}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {itens.map((i) => (
                <CartaoItem key={i.id} item={resumo(i)} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { getItem, relacionadosDe, renderizar, resumo } from "@/lib/conteudo";
import { getPilar, TIPOS, type Tipo } from "@/lib/pilares";
import { BotaoCopiar, BotaoImprimir } from "./Acoes";
import { CartaoItem, SeloRevisao, SeloTipo, Trilha } from "./Cartoes";

export function cabecalhoItem(id: string, tipo: Tipo) {
  const item = getItem(id);
  if (!item || item.tipo !== tipo) notFound();
  const pilar = getPilar(item.pilar)!;
  return { item, pilar };
}

export function Cabecalho({ id, tipo, acoes = true }: { id: string; tipo: Tipo; acoes?: boolean }) {
  const { item, pilar } = cabecalhoItem(id, tipo);
  return (
    <>
      <Trilha
        partes={[
          { href: `/pilar/${pilar.slug}`, rotulo: pilar.nome },
          { href: `/pilar/${pilar.slug}#${tipo}`, rotulo: TIPOS[tipo].plural },
        ]}
      />
      <div className="flex flex-wrap items-center gap-2">
        <SeloTipo tipo={tipo} />
        <SeloRevisao revisao={item.revisao} />
      </div>
      <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-stone-900 sm:text-4xl">
        {item.titulo}
      </h1>
      <p className="mt-3 max-w-3xl text-lg text-stone-600">{item.resumo}</p>
      {acoes && (
        <div className="nao-imprimir mt-4 flex flex-wrap gap-2">
          <BotaoImprimir />
          <BotaoCopiar />
        </div>
      )}
    </>
  );
}

export function Lateral({ id, secoes }: { id: string; secoes?: { id: string; titulo: string }[] }) {
  const item = getItem(id)!;
  const rel = relacionadosDe(item);
  return (
    <aside className="nao-imprimir space-y-8 text-sm lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      {secoes && secoes.length > 2 && (
        <div>
          <h2 className="font-semibold text-stone-900">Nesta página</h2>
          <ul className="mt-2 space-y-1.5 border-l border-stone-200">
            {secoes.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="-ml-px block border-l border-transparent pl-3 text-stone-600 hover:border-mata-600 hover:text-mata-800">
                  {s.titulo}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {item.baseLegal.length > 0 && (
        <div>
          <h2 className="font-semibold text-stone-900">Base legal</h2>
          <ul className="mt-2 space-y-1 text-stone-600">
            {item.baseLegal.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      )}
      {rel.length > 0 && (
        <div>
          <h2 className="font-semibold text-stone-900">Veja também</h2>
          <div className="mt-2 space-y-2">
            {rel.slice(0, 8).map((r) => (
              <CartaoItem key={r.id} item={resumo(r)} />
            ))}
          </div>
        </div>
      )}
      {item.fonte && (
        <div>
          <h2 className="font-semibold text-stone-900">Fonte</h2>
          <p className="mt-2 text-stone-600">{item.fonte}</p>
        </div>
      )}
    </aside>
  );
}

export function Tags({ id }: { id: string }) {
  const item = getItem(id)!;
  if (!item.tags.length) return null;
  return (
    <div className="nao-imprimir mt-10 border-t border-stone-200 pt-6">
      <h2 className="text-sm font-semibold text-stone-900">Assuntos</h2>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {item.tags.map((t) => (
          <Link
            key={t}
            href={`/buscar?q=${encodeURIComponent(t)}`}
            className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-600 hover:bg-mata-100 hover:text-mata-800"
          >
            {t}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Artigo({ id, tipo }: { id: string; tipo: Tipo }) {
  const { item } = cabecalhoItem(id, tipo);
  const { html, secoes } = renderizar(item.corpo, item.arquivo);
  return (
    <div className="container-site py-8">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article className="min-w-0">
          <Cabecalho id={id} tipo={tipo} />
          <div className="conteudo-guia mt-8" dangerouslySetInnerHTML={{ __html: html }} />
          <Tags id={id} />
        </article>
        <Lateral id={id} secoes={secoes} />
      </div>
    </div>
  );
}

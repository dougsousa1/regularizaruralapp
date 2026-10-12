import { CartaoItem, Trilha } from "./Cartoes";
import Icone from "./Icone";
import { itensDoPilar, itensDoTipo, resumo } from "@/lib/conteudo";
import { PILARES, TIPOS, type Tipo } from "@/lib/pilares";

export default function ListaPorPilar({ tipo, descricao }: { tipo: Tipo; descricao: string }) {
  return (
    <div className="container-site pt-2 lg:pt-0">
      <Trilha partes={[{ rotulo: TIPOS[tipo].plural }]} />
      <div className="flex items-center gap-4">
        <span className="icone-caixa h-14 w-14">
          <Icone nome={tipo} className="h-7 w-7" />
        </span>
        <div>
          <p className="rotulo">{itensDoTipo(tipo).length} disponíveis</p>
          <h1 className="titulo-display mt-1 text-3xl sm:text-4xl">{TIPOS[tipo].plural}</h1>
        </div>
      </div>
      <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-white/55">{descricao}</p>

      <div className="sem-barra -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {PILARES.filter((p) => itensDoPilar(p.slug, tipo).length).map((p) => (
          <a key={p.slug} href={`#${p.slug}`} className="chip shrink-0 py-1.5 transition hover:border-ouro-400/40 hover:text-white">
            {p.nome}
            <span className="text-white/30">{itensDoPilar(p.slug, tipo).length}</span>
          </a>
        ))}
      </div>

      {PILARES.map((p) => {
        const itens = itensDoPilar(p.slug, tipo);
        if (!itens.length) return null;
        return (
          <section key={p.slug} id={p.slug} className="mt-10 scroll-mt-24">
            <h2 className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
              <Icone nome={p.icone} className="h-4 w-4 text-ouro-400" />
              {p.nome}
              <span className="h-px flex-1 bg-white/[0.06]" />
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
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

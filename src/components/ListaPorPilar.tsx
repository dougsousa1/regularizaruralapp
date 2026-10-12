import { CartaoItem, Trilha } from "./Cartoes";
import Icone from "./Icone";
import { itensDoPilar, resumo } from "@/lib/conteudo";
import { PILARES, TIPOS, type Tipo } from "@/lib/pilares";

export default function ListaPorPilar({ tipo, descricao }: { tipo: Tipo; descricao: string }) {
  return (
    <div className="container-site py-8">
      <Trilha partes={[{ rotulo: TIPOS[tipo].plural }]} />
      <h1 className="flex items-center gap-3 font-serif text-3xl font-semibold text-stone-900">
        <Icone nome={tipo} className="h-7 w-7 text-mata-600" />
        {TIPOS[tipo].plural}
      </h1>
      <p className="mt-2 max-w-3xl text-stone-600">{descricao}</p>
      {PILARES.map((p) => {
        const itens = itensDoPilar(p.slug, tipo);
        if (!itens.length) return null;
        return (
          <section key={p.slug} className="mt-10">
            <h2 className="text-lg font-semibold text-stone-900">{p.nome}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

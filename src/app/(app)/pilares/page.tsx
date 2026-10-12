import Link from "next/link";
import { Trilha } from "@/components/Cartoes";
import Icone from "@/components/Icone";
import { ProgressoPilar } from "@/components/Painel";
import { todosItens, todosPilares } from "@/lib/conteudo";

export const metadata = { title: "Pilares" };

export default async function Pagina() {
  const [PILARES, todos] = await Promise.all([todosPilares(), todosItens()]);
  const itensDoPilar = (slug: string) => todos.filter((i) => i.pilar === slug);
  return (
    <div className="container-site pt-2 lg:pt-0">
      <Trilha partes={[{ rotulo: "Pilares" }]} />
      <p className="rotulo">Trilhas</p>
      <h1 className="titulo-display mt-2 text-3xl sm:text-4xl">Pilares da mentoria</h1>
      <p className="mt-2 text-white/50">Escolha a área do problema para ver tudo o que existe sobre ela.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {PILARES.map((p, n) => {
          const estudo = itensDoPilar(p.slug)
            .filter((i) => i.tipo === "guia" || i.tipo === "referencia")
            .map((i) => i.id);
          return (
            <Link key={p.slug} href={`/pilar/${p.slug}`} className="vidro-interativo group flex gap-4 p-5">
              <span className="icone-caixa h-12 w-12">
                <Icone nome={p.icone} className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold text-white/30">Pilar {String(n + 1).padStart(2, "0")}</span>
                <span className="titulo-display block text-lg">{p.nome}</span>
                <span className="mt-1 line-clamp-2 block text-sm text-white/50">{p.descricao}</span>
                <span className="mt-4 block">
                  <ProgressoPilar ids={estudo} />
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

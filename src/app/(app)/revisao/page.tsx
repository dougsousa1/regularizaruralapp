import Link from "next/link";
import { Trilha } from "@/components/Cartoes";
import Icone from "@/components/Icone";
import { revisaoDoPilar, todosItens, todosPilares } from "@/lib/conteudo";

export const metadata = { title: "Painel de revisão" };

export default async function Pagina() {
  const [PILARES, todos] = await Promise.all([todosPilares(), todosItens()]);
  const itensDoPilar = (slug: string) => todos.filter((i) => i.pilar === slug);
  return (
    <div className="container-site pt-2 lg:pt-0">
      <Trilha partes={[{ rotulo: "Painel de revisão" }]} />
      <div className="flex items-center gap-4">
        <span className="icone-caixa h-14 w-14">
          <Icone nome="escudo" className="h-7 w-7" />
        </span>
        <div>
          <p className="rotulo">Para a mentora</p>
          <h1 className="titulo-display mt-1 text-3xl sm:text-4xl">Painel de revisão</h1>
        </div>
      </div>
      <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-white/55">
        Pontos a confirmar em cada pilar: referências a conferir, materiais prometidos nas aulas e decisões
        editoriais.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {PILARES.map((p) => {
          const itens = itensDoPilar(p.slug);
          const pendentes = itens.filter((i) => i.revisao !== "revisado").length;
          const pct = itens.length ? Math.round(((itens.length - pendentes) / itens.length) * 100) : 0;
          const conteudo = (
            <>
              <div className="flex items-center gap-3">
                <span className="icone-caixa h-10 w-10">
                  <Icone nome={p.icone} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1 font-semibold text-white">{p.nome}</span>
                <span className="chip">{pendentes} pendentes</span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-mata-400" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-white/40">
                {itens.length - pendentes} de {itens.length} conteúdos revisados
              </p>
            </>
          );
          return revisaoDoPilar(p.slug) ? (
            <Link key={p.slug} href={`/revisao/${p.slug}`} className="vidro-interativo p-5">
              {conteudo}
            </Link>
          ) : (
            <div key={p.slug} className="vidro p-5">
              {conteudo}
            </div>
          );
        })}
      </div>
    </div>
  );
}

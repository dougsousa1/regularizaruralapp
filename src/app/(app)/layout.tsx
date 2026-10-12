import { AbasCelular, BarraLateral, BarraTopo } from "@/components/Navegacao";
import PaletaBusca from "@/components/PaletaBusca";
import SincronizarProgresso from "@/components/SincronizarProgresso";
import ProvedorPilares from "@/components/ProvedorPilares";
import { todosItens, todosPilares } from "@/lib/conteudo";

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const [lista, itens] = await Promise.all([todosPilares(), todosItens()]);
  const pilares = lista.map((p) => ({
    slug: p.slug,
    nome: p.nome,
    icone: p.icone,
    descricao: p.descricao,
    total: itens.filter((i) => i.pilar === p.slug).length,
  }));
  const totalEstudo = itens.filter((i) => i.tipo === "guia" || i.tipo === "referencia").length;

  return (
    <ProvedorPilares pilares={pilares}>
      <BarraLateral pilares={pilares} totalEstudo={totalEstudo} />
      <div className="flex min-h-screen flex-col lg:pl-72">
        <BarraTopo totalEstudo={totalEstudo} />
        <main className="flex-1 pb-10 lg:pb-12">{children}</main>
        <footer className="nao-imprimir border-t border-white/[0.06] pb-20 lg:pb-0">
          <div className="flex flex-col gap-1 px-4 py-6 text-xs text-white/35 sm:px-6 lg:flex-row lg:justify-between lg:px-10">
            <p>Conteúdo exclusivo para alunos do Regulariza Rural.</p>
            <p>Material de apoio — confira sempre a legislação vigente antes de agir no caso concreto.</p>
          </div>
        </footer>
      </div>
      <AbasCelular />
      <PaletaBusca />
      <SincronizarProgresso />
    </ProvedorPilares>
  );
}

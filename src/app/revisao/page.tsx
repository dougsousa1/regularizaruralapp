import Link from "next/link";
import { Trilha } from "@/components/Cartoes";
import { itensDoPilar, revisaoDoPilar } from "@/lib/conteudo";
import { PILARES } from "@/lib/pilares";

export const metadata = { title: "Painel de revisão" };

export default function Pagina() {
  return (
    <div className="container-site py-8">
      <Trilha partes={[{ rotulo: "Painel de revisão" }]} />
      <h1 className="font-serif text-3xl font-semibold text-stone-900">Painel de revisão</h1>
      <p className="mt-2 max-w-3xl text-stone-600">
        Pontos que a mentora precisa confirmar em cada pilar: referências a conferir, materiais prometidos e
        decisões editoriais.
      </p>
      <div className="mt-8 overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-stone-600">
            <tr>
              <th className="px-4 py-3 font-medium">Pilar</th>
              <th className="px-4 py-3 font-medium">Conteúdos</th>
              <th className="px-4 py-3 font-medium">Aguardando revisão</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {PILARES.map((p) => {
              const itens = itensDoPilar(p.slug);
              const pendentes = itens.filter((i) => i.revisao !== "revisado").length;
              return (
                <tr key={p.slug} className="border-t border-stone-100">
                  <td className="px-4 py-3 font-medium text-stone-900">{p.nome}</td>
                  <td className="px-4 py-3">{itens.length}</td>
                  <td className="px-4 py-3">{pendentes}</td>
                  <td className="px-4 py-3 text-right">
                    {revisaoDoPilar(p.slug) && (
                      <Link href={`/revisao/${p.slug}`} className="font-medium text-mata-700">
                        Ver pontos →
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

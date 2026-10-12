import { Trilha } from "@/components/Cartoes";
import GerenciarPilares from "@/components/admin/GerenciarPilares";
import { todosItens, todosPilares } from "@/lib/conteudo";
import AbasAdmin from "../AbasAdmin";
import { paginaAdmin } from "../exigir-admin";

export const metadata = { title: "Pilares · Administração" };
export const dynamic = "force-dynamic";

export default async function Pagina() {
  await paginaAdmin();
  const [pilares, itens] = await Promise.all([todosPilares(), todosItens()]);
  return (
    <div className="container-site pt-2 lg:pt-0">
      <Trilha partes={[{ href: "/admin", rotulo: "Administração" }, { rotulo: "Pilares" }]} />
      <AbasAdmin />
      <p className="rotulo">Painel da mentoria</p>
      <h1 className="titulo-display mt-2 text-3xl sm:text-4xl">Pilares</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-white/55">
        Os pilares aparecem no menu lateral, na página inicial e organizam todos os conteúdos. Crie novos, renomeie, troque o
        ícone ou mude a ordem.
      </p>
      <GerenciarPilares
        pilares={pilares.map((p) => ({
          ...p,
          comeceAqui: p.comeceAqui ?? "",
          total: itens.filter((i) => i.pilar === p.slug).length,
          guias: itens.filter((i) => i.pilar === p.slug && i.tipo === "guia").map((i) => ({ id: i.id, titulo: i.titulo })),
        }))}
      />
    </div>
  );
}

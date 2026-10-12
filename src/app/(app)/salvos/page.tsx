import { Trilha } from "@/components/Cartoes";
import MeusSalvos from "@/components/MeusSalvos";
import { todosItens } from "@/lib/conteudo";

export const metadata = { title: "Meus salvos" };

export default async function Pagina() {
  const totalEstudo = (await todosItens()).filter((i) => i.tipo === "guia" || i.tipo === "referencia").length;
  return (
    <div className="container-site pt-2 lg:pt-0">
      <Trilha partes={[{ rotulo: "Meus salvos" }]} />
      <p className="rotulo">Sua área</p>
      <h1 className="titulo-display mt-2 text-3xl sm:text-4xl">Meus salvos e progresso</h1>
      <MeusSalvos totalEstudo={totalEstudo} />
    </div>
  );
}

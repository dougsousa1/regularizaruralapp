import { Trilha } from "@/components/Cartoes";
import FormularioEscritorio from "@/components/modelos/FormularioEscritorio";

export const metadata = { title: "Meu escritório" };

export default function Pagina() {
  return (
    <div className="container-site pt-2 lg:pt-0">
      <Trilha partes={[{ href: "/modelos", rotulo: "Modelos de documentos" }, { rotulo: "Meu escritório" }]} />
      <p className="rotulo">Papel timbrado</p>
      <h1 className="titulo-display mt-2 text-3xl sm:text-4xl">Meu escritório</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/55">
        A logo e os dados abaixo entram no cabeçalho de todos os documentos que você gerar, no Word e no PDF.
      </p>
      <FormularioEscritorio />
    </div>
  );
}

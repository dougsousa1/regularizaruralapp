import { Trilha } from "@/components/Cartoes";
import Icone from "@/components/Icone";
import CatalogoModelos from "@/components/modelos/CatalogoModelos";
import MeusDocumentos from "@/components/modelos/MeusDocumentos";
import { resumoModelo, todosModelos } from "@/lib/modelos";
import { todosPilares } from "@/lib/conteudo";

export const metadata = { title: "Modelos de documentos" };

export default async function Pagina() {
  const modelos = todosModelos().map(resumoModelo);
  const titulos = Object.fromEntries(modelos.map((m) => [m.id, m.titulo]));
  const pilares = (await todosPilares()).map((p) => ({ slug: p.slug, nome: p.nome, icone: p.icone }));
  return (
    <div className="container-site pt-2 lg:pt-0">
      <Trilha partes={[{ rotulo: "Modelos de documentos" }]} />
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="icone-caixa h-14 w-14">
            <Icone nome="contrato" className="h-7 w-7" />
          </span>
          <div>
            <p className="rotulo">{modelos.length} modelos do curso</p>
            <h1 className="titulo-display mt-1 text-3xl sm:text-4xl">Modelos de documentos</h1>
          </div>
        </div>
        <a href="/escritorio" className="botao-fantasma self-start sm:self-auto">
          <Icone nome="escudo" className="h-4 w-4 text-ouro-300" />
          Meu escritório e logo
        </a>
      </div>
      <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-white/55">
        Contratos, requerimentos, procurações, notificações e demais peças do curso. Abra um modelo, preencha os dados
        pendentes, ajuste o texto clicando direto no documento e baixe em Word ou PDF já com a logo do seu escritório.
      </p>

      <MeusDocumentos titulos={titulos} />
      <CatalogoModelos modelos={modelos} pilares={pilares} />
    </div>
  );
}

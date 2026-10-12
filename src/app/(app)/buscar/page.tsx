import { Suspense } from "react";
import { Trilha } from "@/components/Cartoes";
import BuscaCompleta from "@/components/BuscaCompleta";

export const metadata = { title: "Buscar" };

export default function Pagina() {
  return (
    <div className="container-site pt-2 lg:pt-0">
      <Trilha partes={[{ rotulo: "Buscar" }]} />
      <h1 className="titulo-display text-3xl sm:text-4xl">Buscar na base</h1>
      <Suspense>
        <BuscaCompleta />
      </Suspense>
    </div>
  );
}

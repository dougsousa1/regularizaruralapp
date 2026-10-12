import { Suspense } from "react";
import { Trilha } from "@/components/Cartoes";
import BuscaCompleta from "@/components/BuscaCompleta";

export const metadata = { title: "Buscar" };

export default function Pagina() {
  return (
    <div className="container-site py-8">
      <Trilha partes={[{ rotulo: "Buscar" }]} />
      <h1 className="font-serif text-3xl font-semibold text-stone-900">Buscar na base</h1>
      <Suspense>
        <BuscaCompleta />
      </Suspense>
    </div>
  );
}

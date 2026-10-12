import Link from "next/link";
import Icone from "@/components/Icone";

export default function NaoEncontrado() {
  return (
    <div className="container-site grid place-items-center py-24 text-center">
      <span className="icone-caixa h-16 w-16">
        <Icone nome="lupa" className="h-8 w-8" />
      </span>
      <h1 className="titulo-display mt-6 text-3xl">Página não encontrada</h1>
      <p className="mt-2 text-white/50">O conteúdo pode ter mudado de lugar. Use a busca ou volte ao início.</p>
      <Link href="/" className="botao-ouro mt-8">
        Voltar ao início
      </Link>
    </div>
  );
}

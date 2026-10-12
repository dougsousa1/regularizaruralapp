import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <div className="container-site py-24 text-center">
      <h1 className="font-serif text-3xl font-semibold text-stone-900">Página não encontrada</h1>
      <p className="mt-2 text-stone-600">O conteúdo pode ter mudado de lugar. Use a busca ou volte ao início.</p>
      <Link href="/" className="mt-6 inline-block rounded-lg bg-mata-700 px-4 py-2 text-white hover:bg-mata-800">
        Voltar ao início
      </Link>
    </div>
  );
}

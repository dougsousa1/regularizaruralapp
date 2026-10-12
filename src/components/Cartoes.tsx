import Link from "next/link";
import { getPilar, rotaDoItem, TIPOS, type Tipo } from "@/lib/pilares";
import Icone from "./Icone";

type ItemCartao = { id: string; titulo: string; pilar: string; tipo: Tipo; resumo: string };

export function CartaoItem({ item, mostrarPilar = false }: { item: ItemCartao; mostrarPilar?: boolean }) {
  return (
    <Link
      href={rotaDoItem(item.tipo, item.id)}
      className="group flex gap-3 rounded-xl border border-stone-200 bg-white p-4 transition hover:border-mata-300 hover:shadow-sm"
    >
      <Icone nome={item.tipo} className="mt-0.5 h-5 w-5 shrink-0 text-mata-600" />
      <span className="min-w-0">
        <span className="block font-medium text-stone-900 group-hover:text-mata-800">{item.titulo}</span>
        {mostrarPilar && (
          <span className="block text-xs text-stone-500">
            {TIPOS[item.tipo].nome} · {getPilar(item.pilar)?.nome}
          </span>
        )}
        <span className="mt-1 line-clamp-2 block text-sm text-stone-600">{item.resumo}</span>
      </span>
    </Link>
  );
}

export function Trilha({ partes }: { partes: { href?: string; rotulo: string }[] }) {
  return (
    <nav aria-label="Caminho" className="nao-imprimir mb-4 flex flex-wrap items-center gap-1 text-sm text-stone-500">
      <Link href="/" className="hover:text-mata-700">
        Início
      </Link>
      {partes.map((p) => (
        <span key={p.rotulo} className="flex items-center gap-1">
          <span aria-hidden="true">›</span>
          {p.href ? (
            <Link href={p.href} className="hover:text-mata-700">
              {p.rotulo}
            </Link>
          ) : (
            <span className="text-stone-700">{p.rotulo}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function SeloRevisao({ revisao }: { revisao: string }) {
  if (revisao === "revisado") {
    return (
      <span className="inline-flex items-center rounded-full bg-mata-100 px-2.5 py-0.5 text-xs font-medium text-mata-800">
        Revisado pela mentora
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center rounded-full bg-terra-100 px-2.5 py-0.5 text-xs font-medium text-terra-800"
      title="Conteúdo extraído das aulas, ainda não conferido pela mentora"
    >
      Aguardando revisão
    </span>
  );
}

export function SeloTipo({ tipo }: { tipo: Tipo }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700">
      <Icone nome={tipo} className="h-3.5 w-3.5" />
      {TIPOS[tipo].nome}
    </span>
  );
}

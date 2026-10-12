import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import EditorModelo from "@/components/modelos/EditorModelo";
import { getModelo, todosModelos } from "@/lib/modelos";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return todosModelos().map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const m = getModelo(id);
  return { title: m?.titulo, description: m?.resumo };
}

export default async function Pagina({ params }: Props) {
  const { id } = await params;
  const modelo = getModelo(id);
  if (!modelo) notFound();
  return (
    <div className="-mb-10 lg:-mb-12 lg:-mt-14">
      <Suspense>
        <EditorModelo modelo={modelo} />
      </Suspense>
    </div>
  );
}

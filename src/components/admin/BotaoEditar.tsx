"use client";

import Link from "next/link";
import { useConta } from "@/lib/conta";

/** Atalho para a professora editar a página que está vendo (só aparece para administradores). */
export default function BotaoEditar({ id }: { id: string }) {
  const conta = useConta();
  if (conta?.papel !== "admin") return null;
  return (
    <Link href={`/admin/conteudos/${id}`} className="botao border border-ouro-400/30 bg-ouro-400/10 text-ouro-100 hover:bg-ouro-400/20">
      ✎ Editar
    </Link>
  );
}

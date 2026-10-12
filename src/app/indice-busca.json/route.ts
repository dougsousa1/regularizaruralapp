import { textoDoFluxo, textoPlano, todosItens } from "@/lib/conteudo";

export const dynamic = "force-static";

export async function GET() {
  const docs = (await todosItens()).map((i) => ({
    id: i.id,
    titulo: i.titulo,
    pilar: i.pilar,
    tipo: i.tipo,
    resumo: i.resumo,
    tags: i.tags.join(" "),
    baseLegal: i.baseLegal.join(" "),
    texto: i.fluxo ? textoDoFluxo(i.fluxo) : textoPlano(i.corpo),
  }));
  return Response.json(docs);
}

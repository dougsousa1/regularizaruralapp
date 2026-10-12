import { catalogo } from "@/lib/conteudo";

export const dynamic = "force-static";

export async function GET() {
  return Response.json(await catalogo());
}

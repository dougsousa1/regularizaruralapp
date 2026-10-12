import { catalogo } from "@/lib/conteudo";

export const dynamic = "force-static";

export function GET() {
  return Response.json(catalogo());
}

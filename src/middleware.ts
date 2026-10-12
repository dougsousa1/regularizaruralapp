import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL, type MetadadosAcesso } from "@/lib/supabase/config";

// Páginas que não exigem login.
const PUBLICAS = ["/entrar", "/cadastro", "/recuperar-senha", "/auth"];
// Exigem login, mas não acesso liberado.
const SO_LOGIN = ["/sem-acesso", "/nova-senha"];

function comeca(caminho: string, lista: string[]) {
  return lista.some((p) => caminho === p || caminho.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(lista) {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        resposta = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => resposta.cookies.set(name, value, options));
      },
    },
  });

  // Valida o token de login (e o renova quando preciso).
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const caminho = request.nextUrl.pathname;

  const redirecionar = (destino: string) => {
    const url = request.nextUrl.clone();
    const [rota, busca] = destino.split("?");
    url.pathname = rota;
    url.search = busca ? `?${busca}` : "";
    const r = NextResponse.redirect(url);
    resposta.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  };

  if (comeca(caminho, PUBLICAS)) {
    if (claims && (caminho === "/entrar" || caminho === "/cadastro")) return redirecionar("/");
    return resposta;
  }

  if (!claims) {
    if (caminho.endsWith(".json")) return new NextResponse(null, { status: 401 });
    const proximo = caminho === "/" ? "" : `?proximo=${encodeURIComponent(caminho + request.nextUrl.search)}`;
    return redirecionar(`/entrar${proximo}`);
  }

  if (comeca(caminho, SO_LOGIN)) return resposta;

  const meta = (claims.app_metadata ?? {}) as MetadadosAcesso;
  if (meta.acesso !== "liberado") {
    if (caminho.endsWith(".json")) return new NextResponse(null, { status: 403 });
    return redirecionar("/sem-acesso");
  }
  if (comeca(caminho, ["/admin", "/revisao"]) && meta.papel !== "admin") return redirecionar("/");

  return resposta;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|img/|icone-|apple-touch-icon|manifest.webmanifest|favicon.ico).*)"],
};

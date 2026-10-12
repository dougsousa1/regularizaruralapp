import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseServidor } from "@/lib/supabase/servidor";

// Destino dos links enviados por e-mail (confirmação de cadastro e recuperação de senha).
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const proximoBruto = url.searchParams.get("proximo") ?? "/";
  const proximo = proximoBruto.startsWith("/") && !proximoBruto.startsWith("//") ? proximoBruto : "/";
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const tipo = url.searchParams.get("type") as EmailOtpType | null;

  const supabase = await supabaseServidor();
  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && tipo) {
    ok = !(await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash })).error;
  }

  const destino = url.clone();
  destino.search = "";
  if (ok) {
    destino.pathname = tipo === "recovery" ? "/nova-senha" : proximo;
  } else {
    destino.pathname = "/entrar";
    destino.searchParams.set("erro", "link");
  }
  return NextResponse.redirect(destino);
}

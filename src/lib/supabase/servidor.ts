import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL } from "./config";

export async function supabaseServidor() {
  const loja = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, {
    cookies: {
      getAll() {
        return loja.getAll();
      },
      setAll(lista) {
        try {
          lista.forEach(({ name, value, options }) => loja.set(name, value, options));
        } catch {
          // Chamado a partir de um Server Component: o middleware renova a sessão.
        }
      },
    },
  });
}

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

/**
 * Cliente com a chave secreta: só no servidor, para ler o conteúdo editado no painel
 * (as tabelas de conteúdo não são legíveis por alunos direto do navegador).
 * Sem a variável (ambiente local, prévias) devolve null e o site usa só os arquivos.
 */
export function supabaseSecreto() {
  const chave = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chave || typeof window !== "undefined") return null;
  return createClient(process.env.SUPABASE_URL || SUPABASE_URL, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

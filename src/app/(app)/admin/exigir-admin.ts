import { redirect } from "next/navigation";
import { supabaseServidor } from "@/lib/supabase/servidor";

/** Para páginas do painel: devolve o cliente com a sessão do admin ou manda para o início. */
export async function paginaAdmin() {
  const supabase = await supabaseServidor();
  const { data } = await supabase.rpc("e_admin");
  if (!data) redirect("/");
  return supabase;
}

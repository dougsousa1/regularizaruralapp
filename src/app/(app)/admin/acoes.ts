"use server";

import { revalidatePath } from "next/cache";
import { supabaseServidor } from "@/lib/supabase/servidor";

export type Resultado = { ok: boolean; mensagem: string };

const REGEX_EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

async function exigirAdmin() {
  const supabase = await supabaseServidor();
  const { data } = await supabase.rpc("e_admin");
  if (!data) throw new Error("Apenas administradores.");
  return supabase;
}

/** Libera uma lista de e-mails (um por linha; o nome pode vir na mesma linha). */
export async function liberarEmails(_anterior: Resultado | null, form: FormData): Promise<Resultado> {
  const supabase = await exigirAdmin();
  const papel = form.get("papel") === "admin" ? "admin" : "aluno";
  const linhas = String(form.get("lista") ?? "")
    .split(/\r?\n|;/)
    .map((l) => l.trim())
    .filter(Boolean);

  const comNome: { email: string; nome: string }[] = [];
  const semNome: { email: string }[] = [];
  const invalidas: string[] = [];
  const vistos = new Set<string>();
  for (const l of linhas) {
    const m = l.match(REGEX_EMAIL);
    if (!m) {
      invalidas.push(l);
      continue;
    }
    const email = m[0].toLowerCase();
    if (vistos.has(email)) continue;
    vistos.add(email);
    const nome = l.replace(m[0], "").replace(/[<>,\t|]+/g, " ").replace(/\s+/g, " ").trim();
    if (nome) comNome.push({ email, nome });
    else semNome.push({ email });
  }
  if (!vistos.size) return { ok: false, mensagem: "Nenhum e-mail válido encontrado." };

  const base = { status: "liberado", origem: "manual", ...(papel === "admin" ? { papel } : {}) };
  for (const grupo of [comNome, semNome]) {
    if (!grupo.length) continue;
    const { error } = await supabase
      .from("acessos")
      .upsert(grupo.map((g) => ({ ...g, ...base })), { onConflict: "email" });
    if (error) return { ok: false, mensagem: `Erro ao salvar: ${error.message}` };
  }
  revalidatePath("/admin");
  const extra = invalidas.length ? ` ${invalidas.length} linha(s) sem e-mail foram ignoradas.` : "";
  return { ok: true, mensagem: `${vistos.size} e-mail(s) liberado(s).${extra}` };
}

export async function alterarAcesso(email: string, mudanca: { status?: "liberado" | "bloqueado"; papel?: "aluno" | "admin" }) {
  const supabase = await exigirAdmin();
  const { error } = await supabase.from("acessos").update(mudanca).eq("email", email);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function removerAcesso(email: string) {
  const supabase = await exigirAdmin();
  const { error } = await supabase.from("acessos").delete().eq("email", email);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

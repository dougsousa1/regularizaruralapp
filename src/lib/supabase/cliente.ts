"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL } from "./config";

let cliente: SupabaseClient | null = null;

export function supabaseNavegador(): SupabaseClient {
  if (!cliente) cliente = createBrowserClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA);
  return cliente;
}

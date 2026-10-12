// URL e chave pública do Supabase. As duas são feitas para ficar visíveis no navegador
// (a segurança dos dados vem das regras RLS do banco), por isso há um valor padrão aqui:
// assim as prévias da Vercel funcionam mesmo sem as variáveis de ambiente.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fghvoyhnjckdlzrifadj.supabase.co";

export const SUPABASE_CHAVE_PUBLICA =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_-IY9R8kATdo9ea7_GUM-mw_f70BB4qT";

export type MetadadosAcesso = { acesso?: "liberado" | "bloqueado" | "sem_cadastro"; papel?: "aluno" | "admin" };

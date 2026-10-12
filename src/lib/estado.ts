"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Estado pessoal do aluno, guardado neste navegador:
 * favoritos, conteúdos recentes, conteúdos concluídos e progresso dos checklists.
 */

const EVENTO = "rr-estado";

function ler<T>(chave: string, padrao: T): T {
  try {
    const v = localStorage.getItem(chave);
    return v ? (JSON.parse(v) as T) : padrao;
  } catch {
    return padrao;
  }
}

function gravar(chave: string, valor: unknown) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {}
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: chave }));
}

function assinar(aviso: () => void) {
  const aoMudar = () => aviso();
  window.addEventListener(EVENTO, aoMudar);
  window.addEventListener("storage", aoMudar);
  return () => {
    window.removeEventListener(EVENTO, aoMudar);
    window.removeEventListener("storage", aoMudar);
  };
}

// Cache do valor bruto para o useSyncExternalStore devolver a mesma referência.
const cache = new Map<string, { bruto: string | null; valor: unknown }>();

function snapshot<T>(chave: string, padrao: T): T {
  let bruto: string | null = null;
  try {
    bruto = localStorage.getItem(chave);
  } catch {}
  const c = cache.get(chave);
  if (c && c.bruto === bruto) return c.valor as T;
  const valor = bruto ? ler(chave, padrao) : padrao;
  cache.set(chave, { bruto, valor });
  return valor;
}

const VAZIO: string[] = [];
const VAZIO_OBJ: Record<string, boolean> = {};

export function useArmazenado<T>(chave: string, padrao: T): T {
  return useSyncExternalStore(
    assinar,
    () => snapshot(chave, padrao),
    () => padrao,
  );
}

/** true depois da hidratação (evita divergência entre servidor e navegador). */
export function useMontado(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

// ---------- Listas de ids ----------

const FAVORITOS = "rr:favoritos";
const RECENTES = "rr:recentes";
const CONCLUIDOS = "rr:concluidos";

export function useFavoritos() {
  const lista = useArmazenado<string[]>(FAVORITOS, VAZIO);
  const alternar = useCallback((id: string) => {
    const atual = ler<string[]>(FAVORITOS, []);
    gravar(FAVORITOS, atual.includes(id) ? atual.filter((x) => x !== id) : [id, ...atual]);
  }, []);
  return { lista, alternar, tem: (id: string) => lista.includes(id) };
}

export function useConcluidos() {
  const lista = useArmazenado<string[]>(CONCLUIDOS, VAZIO);
  const alternar = useCallback((id: string) => {
    const atual = ler<string[]>(CONCLUIDOS, []);
    gravar(CONCLUIDOS, atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]);
  }, []);
  return { lista, alternar, tem: (id: string) => lista.includes(id) };
}

export function useRecentes() {
  return useArmazenado<string[]>(RECENTES, VAZIO);
}

export function registrarVisita(id: string) {
  const atual = ler<string[]>(RECENTES, []);
  gravar(RECENTES, [id, ...atual.filter((x) => x !== id)].slice(0, 24));
}

// ---------- Checklists ----------

export function chaveChecklist(id: string) {
  return `checklist:${id}`;
}

export function useMarcacoes(id: string) {
  const chave = chaveChecklist(id);
  const marcados = useArmazenado<Record<string, boolean>>(chave, VAZIO_OBJ);
  const definir = useCallback((novo: Record<string, boolean>) => gravar(chave, novo), [chave]);
  return { marcados, definir };
}

/** Quantos itens marcados em cada checklist (para o painel inicial). */
export function lerMarcadosDe(id: string): number {
  const m = ler<Record<string, boolean>>(chaveChecklist(id), {});
  return Object.values(m).filter(Boolean).length;
}

export function useVersaoEstado(): number {
  // Muda sempre que qualquer estado é gravado; útil para recalcular painéis.
  return useSyncExternalStore(
    assinar,
    () => versao,
    () => 0,
  );
}

let versao = 0;
if (typeof window !== "undefined") {
  const subir = () => {
    versao++;
  };
  window.addEventListener(EVENTO, subir);
  window.addEventListener("storage", subir);
}

// ---------- Sincronização com a conta do aluno ----------

export type EstadoCompleto = {
  favoritos: string[];
  concluidos: string[];
  recentes: string[];
  checklists: Record<string, Record<string, boolean>>;
};

const PREFIXO_CHECKLIST = "checklist:";
export const CHAVE_DONO = "rr:usuario";

export function exportarEstado(): EstadoCompleto {
  const checklists: EstadoCompleto["checklists"] = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIXO_CHECKLIST)) {
        const m = ler<Record<string, boolean>>(k, {});
        const marcados = Object.fromEntries(Object.entries(m).filter(([, v]) => v));
        if (Object.keys(marcados).length) checklists[k.slice(PREFIXO_CHECKLIST.length)] = marcados;
      }
    }
  } catch {}
  return {
    favoritos: ler<string[]>(FAVORITOS, []),
    concluidos: ler<string[]>(CONCLUIDOS, []),
    recentes: ler<string[]>(RECENTES, []),
    checklists,
  };
}

export function importarEstado(e: EstadoCompleto) {
  gravar(FAVORITOS, e.favoritos);
  gravar(CONCLUIDOS, e.concluidos);
  gravar(RECENTES, e.recentes);
  for (const [id, m] of Object.entries(e.checklists)) gravar(chaveChecklist(id), m);
}

/** Apaga do aparelho tudo o que é do aluno (ao sair ou trocar de conta). */
export function limparEstadoLocal() {
  try {
    const remover: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith("rr:") || k.startsWith(PREFIXO_CHECKLIST))) remover.push(k);
    }
    remover.forEach((k) => localStorage.removeItem(k));
  } catch {}
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: "*" }));
}

export function aoMudarEstado(fn: (chave: string) => void): () => void {
  const h = (e: Event) => fn(String((e as CustomEvent).detail ?? ""));
  window.addEventListener(EVENTO, h);
  return () => window.removeEventListener(EVENTO, h);
}

export function juntarEstados(local: EstadoCompleto, remoto: EstadoCompleto): EstadoCompleto {
  const uniao = (a: string[], b: string[]) => [...new Set([...a, ...b])];
  const checklists: EstadoCompleto["checklists"] = { ...remoto.checklists };
  for (const [id, m] of Object.entries(local.checklists)) checklists[id] = { ...(checklists[id] ?? {}), ...m };
  return {
    favoritos: uniao(local.favoritos, remoto.favoritos),
    concluidos: uniao(local.concluidos, remoto.concluidos),
    recentes: uniao(local.recentes, remoto.recentes).slice(0, 24),
    checklists,
  };
}

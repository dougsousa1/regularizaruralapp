import fs from "node:fs";
import path from "node:path";
import type { Modelo, ModeloResumo } from "./modelos-tipos";

const PASTA = path.join(process.cwd(), "conteudo", "modelos");

let cache: Modelo[] | null = null;

export function todosModelos(): Modelo[] {
  if (cache && process.env.NODE_ENV !== "development") return cache;
  if (!fs.existsSync(PASTA)) return (cache = []);
  cache = fs
    .readdirSync(PASTA)
    .filter((n) => n.endsWith(".json"))
    .map((n) => JSON.parse(fs.readFileSync(path.join(PASTA, n), "utf8")) as Modelo)
    .sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
  return cache;
}

export function getModelo(id: string): Modelo | undefined {
  return todosModelos().find((m) => m.id === id);
}

export function resumoModelo(m: Modelo): ModeloResumo {
  return {
    id: m.id,
    titulo: m.titulo,
    tipo: m.tipo,
    pilar: m.pilar,
    resumo: m.resumo,
    nCampos: Object.values(m.campos).filter((c) => c.tipo !== "nota").length,
  };
}

/** Modelos ligados a um guia ou checklist da base. */
export function modelosRelacionados(itemId: string): ModeloResumo[] {
  return todosModelos()
    .filter((m) => m.relacionados.includes(itemId))
    .map(resumoModelo);
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { supabaseNavegador } from "./supabase/cliente";

export type Escritorio = {
  nome: string;
  profissional: string;
  registro: string;
  documento: string;
  endereco: string;
  telefone: string;
  email: string;
  site: string;
  logo_caminho: string | null;
  logo_posicao: "esquerda" | "centro" | "direita";
  mostrar_cabecalho: boolean;
};

export type Logo = { url: string; dados: ArrayBuffer; largura: number; altura: number };

export const ESCRITORIO_VAZIO: Escritorio = {
  nome: "",
  profissional: "",
  registro: "",
  documento: "",
  endereco: "",
  telefone: "",
  email: "",
  site: "",
  logo_caminho: null,
  logo_posicao: "esquerda",
  mostrar_cabecalho: true,
};

async function carregarLogo(caminho: string): Promise<Logo | null> {
  const { data } = await supabaseNavegador().storage.from("logos").download(caminho);
  if (!data) return null;
  const dados = await data.arrayBuffer();
  const url = URL.createObjectURL(data);
  const img = new Image();
  img.src = url;
  await img.decode().catch(() => {});
  return { url, dados, largura: img.naturalWidth || 300, altura: img.naturalHeight || 100 };
}

/** Converte qualquer imagem enviada em PNG (máx. 800 px de largura), para servir no Word e no PDF. */
export async function prepararLogo(arquivo: File): Promise<Blob> {
  const url = URL.createObjectURL(arquivo);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const escala = Math.min(1, 800 / (img.naturalWidth || 800));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round((img.naturalWidth || 800) * escala);
    canvas.height = Math.round((img.naturalHeight || 300) * escala);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise((ok, erro) => canvas.toBlob((b) => (b ? ok(b) : erro(new Error("imagem"))), "image/png"));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function useEscritorio() {
  const [escritorio, setEscritorio] = useState<Escritorio | null>(null);
  const [logo, setLogo] = useState<Logo | null>(null);

  const recarregar = useCallback(async () => {
    const supabase = supabaseNavegador();
    const { data: sessao } = await supabase.auth.getSession();
    const id = sessao.session?.user.id;
    if (!id) return setEscritorio(ESCRITORIO_VAZIO);
    const { data } = await supabase.from("escritorios").select("*").eq("usuario_id", id).maybeSingle();
    const e: Escritorio = { ...ESCRITORIO_VAZIO, ...(data ?? {}) };
    for (const k of Object.keys(e) as (keyof Escritorio)[]) if (e[k] === null && k !== "logo_caminho") (e as Record<string, unknown>)[k] = "";
    setEscritorio(e);
    setLogo(e.logo_caminho ? await carregarLogo(e.logo_caminho) : null);
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return { escritorio, logo, recarregar };
}

export function temCabecalho(e: Escritorio | null, logo: Logo | null) {
  return !!e && e.mostrar_cabecalho && !!(logo || e.nome || e.profissional);
}

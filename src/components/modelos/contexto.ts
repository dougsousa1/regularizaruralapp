"use client";

import { createContext, useContext } from "react";
import type { DefinicaoCampo } from "@/lib/modelos-tipos";

export type ContextoCampos = {
  campos: Record<string, DefinicaoCampo>;
  valores: Record<string, string>;
  foco: string | null;
  focar: (chave: string, origem: "documento" | "painel") => void;
};

export const CamposContexto = createContext<ContextoCampos>({
  campos: {},
  valores: {},
  foco: null,
  focar: () => {},
});

export const useCampos = () => useContext(CamposContexto);

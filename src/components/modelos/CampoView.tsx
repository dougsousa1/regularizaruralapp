"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { formatarValor } from "@/lib/modelos-tipos";
import { useCampos } from "./contexto";

export default function CampoView({ node, selected }: NodeViewProps) {
  const { campos, valores, foco, focar } = useCampos();
  const chave = node.attrs.chave as string;
  const def = campos[chave];
  const marcas = node.marks.map((m) => m.type.name);
  const estilo = {
    fontWeight: marcas.includes("bold") ? 700 : undefined,
    fontStyle: marcas.includes("italic") ? "italic" : undefined,
    textDecoration: marcas.includes("underline") ? "underline" : undefined,
  } as const;

  if (!def) return <NodeViewWrapper as="span" />;

  if (def.tipo === "nota") {
    return (
      <NodeViewWrapper as="span" className="campo-nota" contentEditable={false}>
        <button type="button" title={def.rotulo} onClick={() => focar(chave, "documento")} className="campo-nota-botao">
          nota
        </button>
      </NodeViewWrapper>
    );
  }

  const valor = formatarValor(valores[chave], def.tipo);
  const ativo = foco === chave;
  return (
    <NodeViewWrapper
      as="span"
      contentEditable={false}
      data-campo-chave={chave}
      onClick={() => focar(chave, "documento")}
      className={`campo ${valor ? "campo-preenchido" : "campo-vazio"} ${ativo ? "campo-ativo" : ""} ${selected ? "campo-selecionado" : ""}`}
      style={estilo}
      title={def.rotulo + (def.grupo ? ` · ${def.grupo}` : "")}
    >
      {valor || def.rotulo}
    </NodeViewWrapper>
  );
}

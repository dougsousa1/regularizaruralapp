"use client";

import { Extension, mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import CampoView from "./CampoView";

/** Campo do modelo dentro do texto (ex.: nome do arrendador). Mostra o valor preenchido no painel. */
export const Campo = Node.create({
  name: "campo",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,
  addAttributes() {
    return { chave: { default: "" } };
  },
  parseHTML() {
    return [{ tag: "span[data-campo]", getAttrs: (el) => ({ chave: (el as HTMLElement).getAttribute("data-campo") }) }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes({ "data-campo": HTMLAttributes.chave })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(CampoView, { as: "span" });
  },
});

/** Recuo do parágrafo (0 a 4 níveis), vindo do modelo original. */
export const Recuo = Extension.create({
  name: "recuo",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph"],
        attributes: {
          recuo: {
            default: 0,
            parseHTML: (el) => Number((el as HTMLElement).dataset.recuo ?? 0),
            renderHTML: (a) => (a.recuo ? { "data-recuo": a.recuo, style: `padding-left:${a.recuo * 2.2}em` } : {}),
          },
        },
      },
    ];
  },
});

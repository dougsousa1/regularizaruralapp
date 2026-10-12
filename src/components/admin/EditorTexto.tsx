"use client";

import { useEffect } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Marked } from "marked";
import { MarkdownSerializerState } from "prosemirror-markdown";
import { Markdown } from "tiptap-markdown";

// Correção do tiptap-markdown: ao abrir negrito/itálico no início de um parágrafo que não é o
// primeiro de uma citação, ele anotava a posição antes de escrever o "> " e embaralhava os
// asteriscos ("> ****Texto**"). Escrever o prefixo antes do parágrafo resolve.
type EstadoMd = { write(c?: string): void; renderInline(p: { childCount: number }, inicio?: boolean): void };
const proto = MarkdownSerializerState.prototype as unknown as EstadoMd & { __rr?: boolean };
if (!proto.__rr) {
  const original = proto.renderInline;
  proto.renderInline = function (this: EstadoMd, pai, inicio) {
    if (pai.childCount) this.write();
    return original.call(this, pai, inicio);
  };
  proto.__rr = true;
}

type Props = { valor: string; aoMudar: (md: string) => void; checklist?: boolean };

function Botao({ ativo, onClick, titulo, children, desativado }: { ativo?: boolean; onClick: () => void; titulo: string; children: React.ReactNode; desativado?: boolean }) {
  return (
    <button
      type="button"
      title={titulo}
      aria-label={titulo}
      disabled={desativado}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`h-8 min-w-8 rounded-lg px-2 text-[13px] font-semibold transition disabled:opacity-30 ${
        ativo ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/[0.08] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

const Sep = () => <span className="mx-1 h-5 w-px bg-white/10" />;

function Barra({ editor, checklist }: { editor: Editor; checklist?: boolean }) {
  const c = () => editor.chain().focus();
  const naTabela = editor.isActive("table");
  const link = () => {
    const atual = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(
      "Endereço do link.\nPara outro conteúdo da plataforma use o caminho, ex.: /guia/arrendamento-rural\n(deixe vazio para remover o link)",
      atual ?? "",
    );
    if (url === null) return;
    if (!url.trim()) c().extendMarkRange("link").unsetLink().run();
    else c().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };
  const aviso = () => {
    c().insertContent({
      type: "blockquote",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Conferir:", marks: [{ type: "bold" }] }, { type: "text", text: " " }] }],
    }).run();
  };
  return (
    <div className="sticky top-14 z-10 flex flex-wrap items-center gap-0.5 rounded-t-2xl border-b border-white/[0.08] bg-noite-850/95 px-2 py-1.5 backdrop-blur lg:top-0">
      <Botao titulo="Desfazer" onClick={() => c().undo().run()}>↶</Botao>
      <Botao titulo="Refazer" onClick={() => c().redo().run()}>↷</Botao>
      <Sep />
      <Botao titulo="Texto normal" ativo={editor.isActive("paragraph")} onClick={() => c().setParagraph().run()}>Texto</Botao>
      <Botao titulo="Título de seção" ativo={editor.isActive("heading", { level: 2 })} onClick={() => c().toggleHeading({ level: 2 }).run()}>T1</Botao>
      <Botao titulo="Subtítulo" ativo={editor.isActive("heading", { level: 3 })} onClick={() => c().toggleHeading({ level: 3 }).run()}>T2</Botao>
      <Sep />
      <Botao titulo="Negrito" ativo={editor.isActive("bold")} onClick={() => c().toggleBold().run()}><b>N</b></Botao>
      <Botao titulo="Itálico" ativo={editor.isActive("italic")} onClick={() => c().toggleItalic().run()}><i className="font-serif">I</i></Botao>
      <Botao titulo="Link" ativo={editor.isActive("link")} onClick={link}>🔗</Botao>
      <Sep />
      <Botao titulo="Lista com marcadores" ativo={editor.isActive("bulletList")} onClick={() => c().toggleBulletList().run()}>• Lista</Botao>
      <Botao titulo="Lista numerada" ativo={editor.isActive("orderedList")} onClick={() => c().toggleOrderedList().run()}>1. Lista</Botao>
      <Botao titulo="Item de checklist (caixinha de marcar)" ativo={editor.isActive("taskList")} onClick={() => c().toggleTaskList().run()}>
        ☑ {checklist ? "Item" : "Checklist"}
      </Botao>
      <Sep />
      <Botao titulo="Destaque (caixa verde)" ativo={editor.isActive("blockquote")} onClick={() => c().toggleBlockquote().run()}>Destaque</Botao>
      <Botao titulo="Aviso para conferir (caixa dourada)" onClick={aviso}>⚠ Conferir</Botao>
      <Botao titulo="Linha divisória" onClick={() => c().setHorizontalRule().run()}>―</Botao>
      <Sep />
      {!naTabela ? (
        <Botao titulo="Inserir tabela" onClick={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>▦ Tabela</Botao>
      ) : (
        <>
          <Botao titulo="Adicionar linha abaixo" onClick={() => c().addRowAfter().run()}>+ Linha</Botao>
          <Botao titulo="Adicionar coluna à direita" onClick={() => c().addColumnAfter().run()}>+ Coluna</Botao>
          <Botao titulo="Remover linha" onClick={() => c().deleteRow().run()}>− Linha</Botao>
          <Botao titulo="Remover coluna" onClick={() => c().deleteColumn().run()}>− Coluna</Botao>
          <Botao titulo="Excluir tabela" onClick={() => c().deleteTable().run()}>✕ Tabela</Botao>
        </>
      )}
    </div>
  );
}

export function criarExtensoes(placeholder = "") {
  return [
    StarterKit.configure({ heading: { levels: [2, 3, 4] }, codeBlock: false }),
    Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: null, target: null } }),
    Placeholder.configure({ placeholder }),
    Table.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
    TaskList,
    TaskItem.configure({ nested: true }),
    Markdown.configure({ html: true, tightLists: true, linkify: false, breaks: false, transformPastedText: true, transformCopiedText: false }),
  ];
}

const conversor = new Marked({ gfm: true });

/**
 * Markdown → HTML para abrir no editor. Usa o mesmo conversor do site (quebras de linha,
 * negrito colado em pontuação etc. ficam iguais) e marca os itens de checklist no formato do editor.
 */
export function markdownParaHtml(md: string): string {
  const html = conversor.parse(md) as string;
  if (typeof DOMParser === "undefined") return html;
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  // Quebra de linha simples dentro do parágrafo é um espaço (o editor perderia o espaço).
  const textos = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  for (let n = textos.nextNode(); n; n = textos.nextNode()) {
    if (n.textContent!.includes("\n")) n.textContent = n.textContent!.replace(/\s*\n\s*/g, " ");
  }
  doc.querySelectorAll("li > input[type=checkbox]").forEach((caixa) => {
    const li = caixa.parentElement!;
    const ul = li.parentElement!;
    ul.setAttribute("data-type", "taskList");
    li.setAttribute("data-type", "taskItem");
    li.setAttribute("data-checked", (caixa as HTMLInputElement).checked ? "true" : "false");
    caixa.remove();
    if (li.firstChild?.nodeType === Node.TEXT_NODE) li.firstChild.textContent = li.firstChild.textContent!.replace(/^\s+/, "");
  });
  return doc.body.firstElementChild!.innerHTML;
}

/** Ajustes no Markdown gerado pelo editor para ficar como o restante do conteúdo. */
function arrumar(md: string): string {
  return (
    md
      // itens de checklist seguidos, sem linha em branco entre eles
      .replace(/^(\s*- \[[ xX]\] .*)\n\n(?=\s*- \[[ xX]\] )/gm, "$1\n")
      .replace(/^(\s*- \[[ xX]\] .*)\n\n(?=\s*- \[[ xX]\] )/gm, "$1\n")
      // texto de item de lista que começa com ">" (ex.: "> 15 MF") não pode virar citação
      .replace(/^(\s*(?:[-*+]|\d+\.)\s+(?:\[[ xX]\]\s+)?)>/gm, "$1\\>")
      .trim()
  );
}

export function lerMarkdown(editor: Editor): string {
  return arrumar((editor.storage as { markdown: { getMarkdown(): string } }).markdown.getMarkdown());
}

export default function EditorTexto({ valor, aoMudar, checklist }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: criarExtensoes(checklist ? "Escreva os itens do checklist. Use “☑ Item” para criar caixinhas de marcar." : "Comece a escrever o conteúdo…"),
    content: markdownParaHtml(valor),
    editorProps: { attributes: { class: "conteudo-guia editor-admin min-h-[50vh] px-5 py-4 outline-none sm:px-9" } },
    onUpdate: ({ editor }) => aoMudar(lerMarkdown(editor)),
  });

  // Troca de conteúdo vinda de fora (restaurar versão).
  useEffect(() => {
    if (editor && valor !== lerMarkdown(editor)) editor.commands.setContent(markdownParaHtml(valor));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);

  return (
    <div className="vidro overflow-visible">
      {editor ? <Barra editor={editor} checklist={checklist} /> : <div className="h-11" />}
      <EditorContent editor={editor} />
    </div>
  );
}

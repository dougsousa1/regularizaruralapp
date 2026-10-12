"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { useEscritorio } from "@/lib/escritorio";
import type { Modelo, NoDoc } from "@/lib/modelos-tipos";
import { supabaseNavegador } from "@/lib/supabase/cliente";
import Icone from "../Icone";
import CabecalhoFolha from "./CabecalhoFolha";
import { CamposContexto } from "./contexto";
import { Campo, Recuo } from "./extensoes";
import PainelCampos from "./PainelCampos";

type Status = "novo" | "alterado" | "salvando" | "salvo" | "erro";

function Botao({ ativo, onClick, titulo, children }: { ativo?: boolean; onClick: () => void; titulo: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={titulo}
      aria-label={titulo}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`grid h-8 min-w-8 place-items-center rounded-lg px-1.5 text-sm transition ${ativo ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/[0.08] hover:text-white"}`}
    >
      {children}
    </button>
  );
}

function BarraFerramentas({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  const al = (a: string) => editor.chain().focus().setTextAlign(a).run();
  const linhas = (n: number) => (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
      {[2, 6, 10, 14].map((y, i) => {
        const largura = i % 2 ? (n === 0 ? 9 : n === 1 ? 9 : n === 2 ? 9 : 14) : 14;
        const x = n === 1 ? (16 - largura) / 2 : n === 2 ? 16 - largura - 1 : 1;
        return <rect key={y} x={x} y={y - 0.75} width={largura} height={1.5} rx={0.75} />;
      })}
    </svg>
  );
  return (
    <div className="flex flex-wrap items-center gap-0.5">
      <Botao titulo="Desfazer" onClick={() => editor.chain().focus().undo().run()}>
        <Icone nome="voltar" className="h-4 w-4" />
      </Botao>
      <Botao titulo="Refazer" onClick={() => editor.chain().focus().redo().run()}>
        <Icone nome="seta" className="h-4 w-4" />
      </Botao>
      <span className="mx-1 h-5 w-px bg-white/10" />
      <Botao titulo="Negrito" ativo={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <b>N</b>
      </Botao>
      <Botao titulo="Itálico" ativo={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <i className="font-serif">I</i>
      </Botao>
      <Botao titulo="Sublinhado" ativo={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <u>S</u>
      </Botao>
      <span className="mx-1 h-5 w-px bg-white/10" />
      <Botao titulo="Alinhar à esquerda" ativo={editor.isActive({ textAlign: "left" })} onClick={() => al("left")}>
        {linhas(0)}
      </Botao>
      <Botao titulo="Centralizar" ativo={editor.isActive({ textAlign: "center" })} onClick={() => al("center")}>
        {linhas(1)}
      </Botao>
      <Botao titulo="Alinhar à direita" ativo={editor.isActive({ textAlign: "right" })} onClick={() => al("right")}>
        {linhas(2)}
      </Botao>
      <Botao titulo="Justificar" ativo={editor.isActive({ textAlign: "justify" })} onClick={() => al("justify")}>
        {linhas(3)}
      </Botao>
    </div>
  );
}

export default function EditorModelo({ modelo }: { modelo: Modelo }) {
  const router = useRouter();
  const params = useSearchParams();
  const [valores, setValores] = useState<Record<string, string>>({});
  const [foco, setFoco] = useState<string | null>(null);
  const [titulo, setTitulo] = useState(modelo.titulo);
  const [docId, setDocId] = useState<string | null>(params.get("doc"));
  const [status, setStatus] = useState<Status>("novo");
  const [aba, setAba] = useState<"documento" | "dados">("documento");
  const [baixando, setBaixando] = useState(false);
  const { escritorio, logo } = useEscritorio();
  const carregado = useRef(!params.get("doc"));
  const espera = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false, blockquote: false, horizontalRule: false, code: false, bulletList: false, orderedList: false, listItem: false }),
      Underline,
      TextAlign.configure({ types: ["paragraph"], alignments: ["left", "center", "right", "justify"] }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      Campo,
      Recuo,
    ],
    content: modelo.doc,
    editorProps: { attributes: { class: "documento-editavel", spellcheck: "true", lang: "pt-BR" } },
    onUpdate: () => {
      if (carregado.current) setStatus("alterado");
    },
  });

  // Abre um rascunho salvo (?doc=...)
  useEffect(() => {
    const id = params.get("doc");
    if (!id || !editor) return;
    let ativo = true;
    supabaseNavegador()
      .from("documentos")
      .select("titulo, valores, conteudo")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (!ativo || !data) return;
        setTitulo(data.titulo);
        setValores((data.valores as Record<string, string>) ?? {});
        if (data.conteudo) editor.commands.setContent(data.conteudo as NoDoc);
        carregado.current = true;
        setStatus("salvo");
      });
    return () => {
      ativo = false;
    };
  }, [params, editor]);

  const salvar = useCallback(async () => {
    if (!editor) return;
    setStatus("salvando");
    const supabase = supabaseNavegador();
    const dados = { modelo_id: modelo.id, titulo: titulo.trim() || modelo.titulo, valores, conteudo: editor.getJSON() };
    if (docId) {
      const { error } = await supabase.from("documentos").update(dados).eq("id", docId);
      setStatus(error ? "erro" : "salvo");
    } else {
      const { data, error } = await supabase.from("documentos").insert(dados).select("id").single();
      if (error || !data) return setStatus("erro");
      setDocId(data.id);
      router.replace(`/modelos/${modelo.id}?doc=${data.id}`, { scroll: false });
      setStatus("salvo");
    }
  }, [editor, docId, modelo, titulo, valores, router]);

  // Salva sozinho 2 s depois da última alteração.
  useEffect(() => {
    if (status !== "alterado") return;
    clearTimeout(espera.current);
    espera.current = setTimeout(salvar, 2000);
    return () => clearTimeout(espera.current);
  }, [status, valores, titulo, salvar]);

  const mudarValor = useCallback((chave: string, valor: string) => {
    setValores((v) => ({ ...v, [chave]: valor }));
    if (carregado.current) setStatus("alterado");
  }, []);

  const focar = useCallback((chave: string, origem: "documento" | "painel") => {
    setFoco(chave);
    if (origem === "documento") {
      setAba("dados");
    } else {
      const el = document.querySelector(`[data-campo-chave="${chave}"]`);
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, []);

  const contexto = useMemo(() => ({ campos: modelo.campos, valores, foco, focar }), [modelo.campos, valores, foco, focar]);

  const nomeArquivo = (titulo.trim() || modelo.titulo).replace(/[\\/:*?"<>|]+/g, "-");

  const baixarWord = async () => {
    if (!editor) return;
    setBaixando(true);
    try {
      const { exportarDocx } = await import("@/lib/exportar-docx");
      await exportarDocx({ doc: editor.getJSON() as NoDoc, campos: modelo.campos, valores, escritorio, logo, nomeArquivo });
    } finally {
      setBaixando(false);
    }
  };

  const baixarPdf = () => {
    setAba("documento");
    const raiz = document.documentElement;
    const tituloAntigo = document.title;
    document.title = nomeArquivo;
    raiz.classList.add("imprimir-documento");
    const fim = () => {
      raiz.classList.remove("imprimir-documento");
      document.title = tituloAntigo;
      window.removeEventListener("afterprint", fim);
    };
    window.addEventListener("afterprint", fim);
    setTimeout(() => window.print(), 50);
  };

  const restaurar = () => {
    if (editor && confirm("Voltar o texto ao modelo original? Os dados preenchidos continuam.")) {
      editor.commands.setContent(modelo.doc);
      setStatus("alterado");
    }
  };

  const rotuloStatus = { novo: "Rascunho não salvo", alterado: "Alterações não salvas…", salvando: "Salvando…", salvo: "Salvo", erro: "Erro ao salvar" }[status];

  return (
    <CamposContexto.Provider value={contexto}>
      <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:min-h-screen">
        {/* Barra superior */}
        <div className="nao-imprimir sticky top-16 z-20 border-b border-white/[0.07] bg-noite-900/90 backdrop-blur-xl lg:top-0">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 lg:px-6">
            <Link href="/modelos" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-white/60 hover:text-white" aria-label="Voltar aos modelos">
              <Icone nome="voltar" className="h-4 w-4" />
            </Link>
            <div className="min-w-0 flex-1">
              <input
                value={titulo}
                onChange={(e) => {
                  setTitulo(e.target.value);
                  if (carregado.current) setStatus("alterado");
                }}
                className="w-full truncate bg-transparent font-display text-lg font-bold text-white outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                aria-label="Nome do documento"
              />
              <p className={`text-xs ${status === "erro" ? "text-red-300" : "text-white/40"}`}>{rotuloStatus}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {status !== "salvo" && (
                <button onClick={salvar} className="botao-fantasma" disabled={status === "salvando"}>
                  Salvar
                </button>
              )}
              <button onClick={baixarPdf} className="botao-fantasma">
                <Icone nome="imprimir" className="h-4 w-4" />
                PDF
              </button>
              <button onClick={baixarWord} disabled={baixando} className="botao-ouro disabled:opacity-60">
                <Icone nome="copiar" className="h-4 w-4" />
                {baixando ? "Gerando…" : "Baixar Word"}
              </button>
            </div>
          </div>
          <div className="flex gap-1 px-4 pb-2 lg:hidden">
            {(["documento", "dados"] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAba(a)}
                className={`flex-1 rounded-full py-2 text-sm font-semibold ${aba === a ? "bg-white text-noite-950" : "text-white/55"}`}
              >
                {a === "documento" ? "Documento" : "Preencher dados"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-1">
          {/* Painel de dados */}
          <aside
            className={`nao-imprimir w-full shrink-0 border-r border-white/[0.07] bg-noite-950/40 lg:sticky lg:top-[73px] lg:block lg:h-[calc(100vh-73px)] lg:w-[360px] ${aba === "dados" ? "block" : "hidden"}`}
          >
            <PainelCampos
              campos={modelo.campos}
              grupos={modelo.grupos}
              valores={valores}
              foco={foco}
              aoMudar={mudarValor}
              aoFocar={(k) => focar(k, "painel")}
            />
          </aside>

          {/* Documento */}
          <div className={`min-w-0 flex-1 ${aba === "documento" ? "block" : "hidden"} lg:block`}>
            <div className="nao-imprimir z-10 flex lg:sticky flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] bg-noite-900/80 px-4 py-1.5 backdrop-blur lg:top-[73px] lg:px-6">
              <BarraFerramentas editor={editor} />
              <div className="flex items-center gap-3 text-xs text-white/45">
                <span className="hidden items-center gap-1.5 sm:flex">
                  <span className="campo-legenda" /> clique num campo para preencher
                </span>
                <button onClick={restaurar} className="hover:text-white">
                  Restaurar modelo
                </button>
              </div>
            </div>
            <div className="area-folha px-2 py-6 sm:px-6 lg:py-10">
              <div className="folha-documento mx-auto w-full max-w-[210mm] rounded-sm bg-white px-6 py-10 text-stone-900 shadow-2xl shadow-black/50 sm:px-[20mm] sm:py-[22mm]">
                <CabecalhoFolha escritorio={escritorio} logo={logo} />
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </CamposContexto.Provider>
  );
}

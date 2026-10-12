"use client";

import {
  AlignmentType,
  BorderStyle,
  Document,
  Header,
  ImageRun,
  Packer,
  Paragraph,
  Tab,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { Escritorio, Logo } from "./escritorio";
import { formatarValor, type DefinicaoCampo, type NoDoc } from "./modelos-tipos";

const FONTE = "Tahoma";
const TAMANHO = 22; // 11 pt

const ALINHAMENTO = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
  justify: AlignmentType.JUSTIFIED,
} as const;

type Contexto = { campos: Record<string, DefinicaoCampo>; valores: Record<string, string> };

function runs(nos: NoDoc[] | undefined, ctx: Contexto): TextRun[] {
  const saida: TextRun[] = [];
  for (const no of nos ?? []) {
    const marcas = (no.marks ?? []).map((m) => m.type);
    const base = {
      bold: marcas.includes("bold"),
      italics: marcas.includes("italic"),
      underline: marcas.includes("underline") ? {} : undefined,
      font: FONTE,
      size: TAMANHO,
    };
    if (no.type === "hardBreak") {
      saida.push(new TextRun({ break: 1 }));
    } else if (no.type === "text") {
      const partes = (no.text ?? "").split("\t");
      const filhos: (string | Tab)[] = [];
      partes.forEach((p, i) => {
        if (i) filhos.push(new Tab());
        if (p) filhos.push(p);
      });
      saida.push(new TextRun({ ...base, children: filhos }));
    } else if (no.type === "campo") {
      const chave = String(no.attrs?.chave ?? "");
      const def = ctx.campos[chave];
      if (!def || def.tipo === "nota") continue;
      const valor = formatarValor(ctx.valores[chave], def.tipo);
      saida.push(
        valor
          ? new TextRun({ ...base, text: valor })
          : new TextRun({ ...base, text: `[${def.rotulo}]`, highlight: "yellow" }),
      );
    }
  }
  return saida;
}

function blocos(nos: NoDoc[] | undefined, ctx: Contexto): (Paragraph | Table)[] {
  const saida: (Paragraph | Table)[] = [];
  for (const no of nos ?? []) {
    if (no.type === "paragraph") {
      const al = (no.attrs?.textAlign as keyof typeof ALINHAMENTO) ?? "left";
      const recuo = Number(no.attrs?.recuo ?? 0);
      saida.push(
        new Paragraph({
          alignment: ALINHAMENTO[al] ?? AlignmentType.LEFT,
          indent: recuo ? { left: recuo * 720 } : undefined,
          spacing: { after: 120, line: 300 },
          children: runs(no.content, ctx),
        }),
      );
    } else if (no.type === "table") {
      const linhas = (no.content ?? []).map(
        (tr) =>
          new TableRow({
            children: (tr.content ?? []).map(
              (td) =>
                new TableCell({
                  children: (blocos(td.content, ctx).filter((b) => b instanceof Paragraph) as Paragraph[]).length
                    ? (blocos(td.content, ctx).filter((b) => b instanceof Paragraph) as Paragraph[])
                    : [new Paragraph("")],
                }),
            ),
          }),
      );
      if (linhas.length) saida.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: linhas }));
    }
  }
  return saida;
}

function cabecalho(e: Escritorio | null, logo: Logo | null): Header | undefined {
  if (!e || !e.mostrar_cabecalho || !(logo || e.nome || e.profissional)) return undefined;
  const al = e.logo_posicao === "centro" ? AlignmentType.CENTER : e.logo_posicao === "direita" ? AlignmentType.RIGHT : AlignmentType.LEFT;
  const filhos: Paragraph[] = [];
  if (logo) {
    const altura = 56;
    const largura = Math.round((logo.largura / Math.max(1, logo.altura)) * altura);
    filhos.push(
      new Paragraph({
        alignment: al,
        children: [new ImageRun({ type: "png", data: logo.dados, transformation: { width: Math.min(largura, 260), height: altura } })],
      }),
    );
  }
  const linhas = [
    e.nome,
    [e.profissional, e.registro].filter(Boolean).join(" · "),
    [e.endereco, e.telefone, e.email, e.site].filter(Boolean).join(" · "),
  ].filter(Boolean);
  linhas.forEach((l, i) =>
    filhos.push(
      new Paragraph({
        alignment: al,
        spacing: { after: 0 },
        border: i === linhas.length - 1 ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: "B08A4A", space: 6 } } : undefined,
        children: [new TextRun({ text: l, font: FONTE, size: i === 0 ? 20 : 16, bold: i === 0, color: i === 0 ? "222222" : "666666" })],
      }),
    ),
  );
  return new Header({ children: filhos });
}

export async function exportarDocx(opcoes: {
  doc: NoDoc;
  campos: Record<string, DefinicaoCampo>;
  valores: Record<string, string>;
  escritorio: Escritorio | null;
  logo: Logo | null;
  nomeArquivo: string;
}) {
  const ctx = { campos: opcoes.campos, valores: opcoes.valores };
  const cab = cabecalho(opcoes.escritorio, opcoes.logo);
  const documento = new Document({
    creator: "Regulariza Rural",
    styles: { default: { document: { run: { font: FONTE, size: TAMANHO } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1418, bottom: 1418, left: 1701, right: 1134, header: 567 },
          },
        },
        headers: cab ? { default: cab } : undefined,
        children: blocos(opcoes.doc.content, ctx),
      },
    ],
  });
  const blob = await Packer.toBlob(documento);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${opcoes.nomeArquivo}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

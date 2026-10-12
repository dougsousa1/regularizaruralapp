"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getItem, itemOriginal, slugify, TAG_CONTEUDO, todosItens, todosPilares, type Item, type LinhaConteudo } from "@/lib/conteudo";
import { ICONES_PILAR, type Tipo } from "@/lib/pilares";
import { supabaseServidor } from "@/lib/supabase/servidor";

export type Resposta = { ok: boolean; mensagem: string; id?: string };

export type DadosConteudo = {
  id?: string;
  pilar: string;
  tipo: Tipo;
  titulo: string;
  resumo: string;
  tags: string[];
  baseLegal: string[];
  relacionados: string[];
  fonte: string;
  revisao: string;
  corpo: string;
};

export type DadosPilar = { slug?: string; nome: string; descricao: string; icone: string; comeceAqui: string };

async function exigirAdmin() {
  const supabase = await supabaseServidor();
  const { data } = await supabase.rpc("e_admin");
  if (!data) throw new Error("Apenas administradores.");
  return supabase;
}

/** Atualiza o site inteiro depois de uma alteração. */
function publicar() {
  revalidateTag(TAG_CONTEUDO);
  revalidatePath("/", "layout");
  revalidatePath("/indice-busca.json");
  revalidatePath("/catalogo.json");
}

const limpar = (l: string[]) => [...new Set(l.map((x) => x.trim()).filter(Boolean))];

function linha(i: Item, excluido = false): Omit<LinhaConteudo, "atualizado_em"> {
  return {
    id: i.id,
    pilar: i.pilar,
    tipo: i.tipo,
    titulo: i.titulo,
    resumo: i.resumo,
    tags: i.tags,
    base_legal: i.baseLegal,
    relacionados: i.relacionados,
    fonte: i.fonte,
    revisao: i.revisao,
    corpo: i.corpo,
    fluxo: i.fluxo ?? null,
    excluido,
  };
}

async function idLivre(supabase: Awaited<ReturnType<typeof supabaseServidor>>, titulo: string) {
  const base = slugify(titulo).slice(0, 70).replace(/-+$/, "") || "conteudo";
  const usados = new Set((await todosItens()).map((i) => i.id));
  const { data } = await supabase.from("conteudos").select("id").like("id", `${base}%`);
  (data ?? []).forEach((r) => usados.add(r.id));
  if (itemOriginal(base)) usados.add(base);
  let id = base;
  for (let n = 2; usados.has(id); n++) id = `${base}-${n}`;
  return id;
}

export async function salvarConteudo(d: DadosConteudo): Promise<Resposta> {
  try {
    const supabase = await exigirAdmin();
    const titulo = d.titulo.trim();
    if (!titulo) return { ok: false, mensagem: "Dê um título ao conteúdo." };
    if (!(await todosPilares()).some((p) => p.slug === d.pilar)) return { ok: false, mensagem: "Escolha um pilar válido." };

    const atual = d.id ? await getItem(d.id) : undefined;
    if (d.id && !atual) return { ok: false, mensagem: "Este conteúdo não existe mais. Recarregue a página." };
    const tipo: Tipo = atual?.tipo ?? (["guia", "checklist", "referencia"].includes(d.tipo) ? d.tipo : "guia");
    const id = atual?.id ?? (await idLivre(supabase, titulo));

    const item: Item = {
      id,
      pilar: d.pilar,
      tipo,
      titulo,
      resumo: d.resumo.trim(),
      tags: limpar(d.tags),
      baseLegal: limpar(d.baseLegal),
      relacionados: limpar(d.relacionados).filter((r) => r !== id),
      fonte: d.fonte.trim(),
      revisao: d.revisao === "revisado" ? "revisado" : "pendente",
      corpo: tipo === "fluxo" ? "" : d.corpo.trim(),
      fluxo: atual?.fluxo,
      origem: atual?.origem ?? "novo",
    };
    const { error } = await supabase.from("conteudos").upsert(linha(item));
    if (error) return { ok: false, mensagem: `Não foi possível salvar: ${error.message}` };
    publicar();
    return { ok: true, mensagem: "Salvo e publicado.", id };
  } catch (e) {
    return { ok: false, mensagem: (e as Error).message };
  }
}

export async function excluirConteudo(id: string): Promise<Resposta> {
  try {
    const supabase = await exigirAdmin();
    const atual = await getItem(id);
    if (!atual) return { ok: false, mensagem: "Conteúdo não encontrado." };
    const { error } = await supabase.from("conteudos").upsert(linha(atual, true));
    if (error) return { ok: false, mensagem: error.message };
    publicar();
    return { ok: true, mensagem: "Conteúdo excluído." };
  } catch (e) {
    return { ok: false, mensagem: (e as Error).message };
  }
}

/** Desfaz uma exclusão: o item volta como estava antes de ser excluído. */
export async function reativarConteudo(id: string): Promise<Resposta> {
  try {
    const supabase = await exigirAdmin();
    const { error } = await supabase.from("conteudos").update({ excluido: false }).eq("id", id);
    if (error) return { ok: false, mensagem: error.message };
    publicar();
    return { ok: true, mensagem: "Conteúdo restaurado." };
  } catch (e) {
    return { ok: false, mensagem: (e as Error).message };
  }
}

/** Volta um conteúdo do curso ao texto original (apaga as edições; ficam no histórico). */
export async function restaurarOriginal(id: string): Promise<Resposta> {
  try {
    const supabase = await exigirAdmin();
    if (!itemOriginal(id)) return { ok: false, mensagem: "Este conteúdo foi criado no painel e não tem versão original." };
    const { error } = await supabase.from("conteudos").delete().eq("id", id);
    if (error) return { ok: false, mensagem: error.message };
    publicar();
    return { ok: true, mensagem: "Texto original restaurado." };
  } catch (e) {
    return { ok: false, mensagem: (e as Error).message };
  }
}

export async function restaurarVersao(versaoId: number): Promise<Resposta> {
  try {
    const supabase = await exigirAdmin();
    const { data, error } = await supabase.from("conteudos_versoes").select("dados").eq("id", versaoId).single();
    if (error || !data) return { ok: false, mensagem: "Versão não encontrada." };
    const v = data.dados as LinhaConteudo & { atualizado_por?: string };
    const { atualizado_em: _a, atualizado_por: _p, ...resto } = v;
    const { error: e2 } = await supabase.from("conteudos").upsert({ ...resto, excluido: false });
    if (e2) return { ok: false, mensagem: e2.message };
    publicar();
    return { ok: true, mensagem: "Versão restaurada.", id: v.id };
  } catch (e) {
    return { ok: false, mensagem: (e as Error).message };
  }
}

// ---------- Pilares ----------

export async function salvarPilar(d: DadosPilar): Promise<Resposta> {
  try {
    const supabase = await exigirAdmin();
    const nome = d.nome.trim();
    if (!nome) return { ok: false, mensagem: "Dê um nome ao pilar." };
    const pilares = await todosPilares();
    let slug = d.slug;
    let ordem: number;
    if (slug) {
      const n = pilares.findIndex((p) => p.slug === slug);
      if (n < 0) return { ok: false, mensagem: "Pilar não encontrado." };
      ordem = n * 10;
    } else {
      const baseSlug = slugify(nome).slice(0, 40).replace(/-+$/, "") || "pilar";
      const { data } = await supabase.from("pilares").select("slug");
      const usados = new Set([...pilares.map((p) => p.slug), ...(data ?? []).map((r) => r.slug), "modelos"]);
      slug = baseSlug;
      for (let n = 2; usados.has(slug); n++) slug = `${baseSlug}-${n}`;
      ordem = pilares.length * 10;
    }
    const { error } = await supabase.from("pilares").upsert({
      slug,
      nome,
      descricao: d.descricao.trim(),
      icone: ICONES_PILAR.includes(d.icone) ? d.icone : "estrela",
      comece_aqui: d.comeceAqui || null,
      ordem,
      excluido: false,
    });
    if (error) return { ok: false, mensagem: error.message };
    publicar();
    return { ok: true, mensagem: "Pilar salvo.", id: slug };
  } catch (e) {
    return { ok: false, mensagem: (e as Error).message };
  }
}

export async function ordenarPilares(slugs: string[]): Promise<Resposta> {
  try {
    const supabase = await exigirAdmin();
    const pilares = await todosPilares();
    const linhas = slugs
      .map((s, n) => {
        const p = pilares.find((x) => x.slug === s);
        return p && { slug: p.slug, nome: p.nome, descricao: p.descricao, icone: p.icone, comece_aqui: p.comeceAqui ?? null, ordem: n * 10, excluido: false };
      })
      .filter((l): l is NonNullable<typeof l> => !!l);
    const { error } = await supabase.from("pilares").upsert(linhas);
    if (error) return { ok: false, mensagem: error.message };
    publicar();
    return { ok: true, mensagem: "Ordem salva." };
  } catch (e) {
    return { ok: false, mensagem: (e as Error).message };
  }
}

export async function excluirPilar(slug: string): Promise<Resposta> {
  try {
    const supabase = await exigirAdmin();
    const pilar = (await todosPilares()).find((p) => p.slug === slug);
    if (!pilar) return { ok: false, mensagem: "Pilar não encontrado." };
    const n = (await todosItens()).filter((i) => i.pilar === slug).length;
    if (n) return { ok: false, mensagem: `O pilar ainda tem ${n} conteúdo(s). Mova ou exclua os conteúdos antes.` };
    const { error } = await supabase.from("pilares").upsert({
      slug,
      nome: pilar.nome,
      descricao: pilar.descricao,
      icone: pilar.icone,
      comece_aqui: pilar.comeceAqui ?? null,
      excluido: true,
    });
    if (error) return { ok: false, mensagem: error.message };
    publicar();
    return { ok: true, mensagem: "Pilar excluído." };
  } catch (e) {
    return { ok: false, mensagem: (e as Error).message };
  }
}

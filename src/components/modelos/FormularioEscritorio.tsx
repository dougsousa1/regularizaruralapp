"use client";

import { useEffect, useRef, useState } from "react";
import { ESCRITORIO_VAZIO, prepararLogo, temCabecalho, useEscritorio, type Escritorio } from "@/lib/escritorio";
import { supabaseNavegador } from "@/lib/supabase/cliente";
import Icone from "../Icone";
import CabecalhoFolha from "./CabecalhoFolha";

const CAMPOS: { chave: keyof Escritorio; rotulo: string; dica: string; largo?: boolean }[] = [
  { chave: "nome", rotulo: "Nome do escritório", dica: "Ex.: Dantas Advocacia Agrária", largo: true },
  { chave: "profissional", rotulo: "Profissional responsável", dica: "Ex.: Dra. Maria Souza" },
  { chave: "registro", rotulo: "Registro profissional", dica: "Ex.: OAB/MT 12.345" },
  { chave: "documento", rotulo: "CNPJ / CPF", dica: "Opcional" },
  { chave: "telefone", rotulo: "Telefone / WhatsApp", dica: "(65) 99999-0000" },
  { chave: "email", rotulo: "E-mail", dica: "contato@escritorio.com.br" },
  { chave: "site", rotulo: "Site ou Instagram", dica: "Opcional" },
  { chave: "endereco", rotulo: "Endereço", dica: "Rua, número, cidade/UF", largo: true },
];

const entrada =
  "h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-ouro-400/50 focus-visible:ring-0 focus-visible:ring-offset-0";

export default function FormularioEscritorio() {
  const { escritorio, logo, recarregar } = useEscritorio();
  const [form, setForm] = useState<Escritorio>(ESCRITORIO_VAZIO);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const arquivo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (escritorio) setForm(escritorio);
  }, [escritorio]);

  const usuario = async () => (await supabaseNavegador().auth.getSession()).data.session?.user.id;

  const gravar = async (dados: Escritorio) => {
    const id = await usuario();
    if (!id) throw new Error("sessão");
    const linha = {
      usuario_id: id,
      ...Object.fromEntries(Object.entries(dados).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])),
      atualizado_em: new Date().toISOString(),
    };
    const { error } = await supabaseNavegador().from("escritorios").upsert(linha);
    if (error) throw error;
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setOcupado(true);
    setMsg(null);
    try {
      await gravar(form);
      await recarregar();
      setMsg({ tipo: "ok", texto: "Dados salvos. Eles já aparecem nos seus documentos." });
    } catch {
      setMsg({ tipo: "erro", texto: "Não foi possível salvar. Tente de novo." });
    } finally {
      setOcupado(false);
    }
  };

  const enviarLogo = async (f: File | undefined) => {
    if (!f) return;
    if (!/^image\/(png|jpe?g|webp|svg\+xml)$/.test(f.type)) return setMsg({ tipo: "erro", texto: "Envie uma imagem PNG, JPG, WEBP ou SVG." });
    if (f.size > 8 * 1024 * 1024) return setMsg({ tipo: "erro", texto: "Imagem muito grande (máx. 8 MB)." });
    setOcupado(true);
    setMsg(null);
    try {
      const id = await usuario();
      if (!id) throw new Error("sessão");
      const png = await prepararLogo(f);
      const caminho = `${id}/logo-${Date.now()}.png`;
      const storage = supabaseNavegador().storage.from("logos");
      const { error } = await storage.upload(caminho, png, { contentType: "image/png", upsert: true });
      if (error) throw error;
      const antigo = form.logo_caminho;
      const novo = { ...form, logo_caminho: caminho };
      await gravar(novo);
      if (antigo) await storage.remove([antigo]);
      setForm(novo);
      await recarregar();
      setMsg({ tipo: "ok", texto: "Logo atualizada." });
    } catch {
      setMsg({ tipo: "erro", texto: "Não foi possível enviar a logo. Tente uma imagem menor." });
    } finally {
      setOcupado(false);
      if (arquivo.current) arquivo.current.value = "";
    }
  };

  const removerLogo = async () => {
    if (!form.logo_caminho || !confirm("Remover a logo?")) return;
    setOcupado(true);
    try {
      await supabaseNavegador().storage.from("logos").remove([form.logo_caminho]);
      const novo = { ...form, logo_caminho: null };
      await gravar(novo);
      setForm(novo);
      await recarregar();
    } finally {
      setOcupado(false);
    }
  };

  const previa = { ...form, mostrar_cabecalho: true };

  return (
    <form onSubmit={salvar} className="mt-8 grid gap-8 pb-8 lg:grid-cols-[1fr_minmax(0,420px)]">
      <div className="space-y-6">
        <section className="vidro p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-white">Logo</h2>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="grid h-24 w-full place-items-center rounded-xl bg-white p-3 sm:w-56">
              {logo ? <img src={logo.url} alt="Logo do escritório" className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-stone-400">Sem logo</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => arquivo.current?.click()} disabled={ocupado} className="botao-ouro disabled:opacity-60">
                <Icone nome="mais" className="h-4 w-4" />
                {logo ? "Trocar logo" : "Enviar logo"}
              </button>
              {logo && (
                <button type="button" onClick={removerLogo} disabled={ocupado} className="botao-fantasma">
                  Remover
                </button>
              )}
              <input ref={arquivo} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={(e) => enviarLogo(e.target.files?.[0])} />
            </div>
          </div>
          <p className="mt-3 text-xs text-white/40">PNG com fundo transparente fica melhor. A imagem é ajustada automaticamente.</p>

          <p className="mt-6 text-sm font-semibold text-white/80">Posição no cabeçalho</p>
          <div className="mt-2 inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1">
            {(["esquerda", "centro", "direita"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setForm({ ...form, logo_posicao: p })}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition ${form.logo_posicao === p ? "bg-white text-noite-950" : "text-white/55 hover:text-white"}`}
              >
                {p}
              </button>
            ))}
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-white/70">
            <input
              type="checkbox"
              checked={form.mostrar_cabecalho}
              onChange={(e) => setForm({ ...form, mostrar_cabecalho: e.target.checked })}
              className="h-4 w-4 accent-[#d4a253]"
            />
            Usar o cabeçalho nos documentos
          </label>
        </section>

        <section className="vidro p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-white">Dados do escritório</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {CAMPOS.map((c) => (
              <label key={c.chave} className={c.largo ? "sm:col-span-2" : ""}>
                <span className="mb-1.5 block text-xs font-semibold text-white/60">{c.rotulo}</span>
                <input
                  value={(form[c.chave] as string) ?? ""}
                  onChange={(e) => setForm({ ...form, [c.chave]: e.target.value })}
                  placeholder={c.dica}
                  className={entrada}
                />
              </label>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={ocupado} className="botao-ouro px-6 disabled:opacity-60">
            {ocupado ? "Salvando…" : "Salvar"}
          </button>
          {msg && <p className={`text-sm ${msg.tipo === "ok" ? "text-mata-300" : "text-red-300"}`}>{msg.texto}</p>}
        </div>
      </div>

      <div className="lg:sticky lg:top-16 lg:self-start">
        <p className="rotulo mb-3 text-white/40">Prévia</p>
        <div className="rounded-sm bg-white p-6 text-stone-900 shadow-2xl shadow-black/50">
          {!form.mostrar_cabecalho ? (
            <p className="mb-6 text-xs text-stone-400">Cabeçalho desligado.</p>
          ) : temCabecalho(previa, logo) ? (
            <CabecalhoFolha escritorio={previa} logo={logo} />
          ) : (
            <p className="mb-6 rounded-lg border-2 border-dashed border-stone-200 py-4 text-center text-xs text-stone-400">Seu cabeçalho aparece aqui</p>
          )}
          <p className="text-center font-[Tahoma,sans-serif] text-[10pt] font-bold">CONTRATO DE ARRENDAMENTO RURAL</p>
          <div className="mt-4 space-y-2">
            {[100, 96, 98, 70, 0, 100, 92, 60].map((w, i) => (
              <div key={i} className="h-1.5 rounded bg-stone-200" style={{ width: `${w}%`, opacity: w ? 1 : 0 }} />
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}

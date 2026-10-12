import Link from "next/link";
import { notFound } from "next/navigation";
import { getItem, getPilar, itensDoPilar, relacionadosDe, renderizar, rota } from "@/lib/conteudo";
import { modelosRelacionados } from "@/lib/modelos";
import { TIPOS, type Tipo } from "@/lib/pilares";
import { BarraLeitura, BotaoConcluir, BotaoCopiar, BotaoImprimir, BotaoSalvar, Indice, RegistrarVisita } from "./Acoes";
import { IconeTipo, SeloRevisao, SeloTipo, Trilha } from "./Cartoes";
import BotaoEditar from "./admin/BotaoEditar";
import Icone from "./Icone";

export async function cabecalhoItem(id: string, tipo: Tipo) {
  const item = await getItem(id);
  if (!item || item.tipo !== tipo) notFound();
  const pilar = await getPilar(item.pilar);
  if (!pilar) notFound();
  return { item, pilar };
}

export async function Cabecalho({ id, tipo, concluivel = true }: { id: string; tipo: Tipo; concluivel?: boolean }) {
  const { item, pilar } = await cabecalhoItem(id, tipo);
  return (
    <header className="animate-surgir">
      <RegistrarVisita id={id} />
      <Trilha
        partes={[
          { href: `/pilar/${pilar.slug}`, rotulo: pilar.nome },
          { href: `/pilar/${pilar.slug}`, rotulo: TIPOS[tipo].plural },
        ]}
      />
      <div className="flex flex-wrap items-center gap-2">
        <SeloTipo tipo={tipo} />
        <SeloRevisao revisao={item.revisao} />
      </div>
      <h1 className="titulo-display mt-4 text-[1.85rem] leading-[1.12] sm:text-[2.6rem]">{item.titulo}</h1>
      <p className="mt-4 max-w-3xl text-[15.5px] leading-relaxed text-white/55 sm:text-base">{item.resumo}</p>
      <div className="nao-imprimir mt-6 flex flex-wrap gap-2">
        {concluivel && <BotaoConcluir id={id} />}
        <BotaoSalvar id={id} />
        <BotaoCopiar />
        <BotaoImprimir />
        <BotaoEditar id={id} />
      </div>
    </header>
  );
}

export async function Lateral({ id, secoes }: { id: string; secoes?: { id: string; titulo: string }[] }) {
  const item = (await getItem(id))!;
  const rel = await relacionadosDe(item);
  const modelos = modelosRelacionados(id);
  return (
    <aside className="nao-imprimir space-y-5 lg:sticky lg:top-16 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:pb-8 sem-barra">
      {secoes && secoes.length > 2 && (
        <div className="hidden lg:block">
          <p className="rotulo text-white/40">Nesta página</p>
          <Indice secoes={secoes} />
        </div>
      )}
      {item.baseLegal.length > 0 && (
        <div className="vidro p-5">
          <p className="rotulo flex items-center gap-2">
            <Icone nome="livro" className="h-3.5 w-3.5" /> Base legal
          </p>
          <ul className="mt-3 space-y-2 text-[13px] leading-snug text-white/65">
            {item.baseLegal.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ouro-400" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}
      {modelos.length > 0 && (
        <div className="vidro p-2">
          <p className="rotulo px-3 pb-1 pt-3 text-white/40">Modelos para usar</p>
          <ul>
            {modelos.slice(0, 6).map((m) => (
              <li key={m.id}>
                <Link href={`/modelos/${m.id}`} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/[0.05]">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-200">
                    <Icone nome="contrato" className="h-[16px] w-[16px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-[13px] font-semibold leading-snug text-white/85 group-hover:text-white">{m.titulo}</span>
                    <span className="text-[11px] text-white/35">Abrir e preencher</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {rel.length > 0 && (
        <div className="vidro p-2">
          <p className="rotulo px-3 pb-1 pt-3 text-white/40">Veja também</p>
          <ul>
            {rel.slice(0, 8).map((r) => (
              <li key={r.id}>
                <Link href={rota(r)} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/[0.05]">
                  <IconeTipo tipo={r.tipo} tamanho="h-8 w-8" />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-[13px] font-semibold leading-snug text-white/85 group-hover:text-white">{r.titulo}</span>
                    <span className="text-[11px] text-white/35">{TIPOS[r.tipo].nome}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {item.fonte && (
        <p className="px-1 text-xs leading-relaxed text-white/35">
          <span className="font-semibold text-white/50">Fonte:</span> {item.fonte}
        </p>
      )}
    </aside>
  );
}

export async function Tags({ id }: { id: string }) {
  const item = (await getItem(id))!;
  if (!item.tags.length) return null;
  return (
    <div className="nao-imprimir mt-8">
      <p className="rotulo text-white/40">Assuntos</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {item.tags.map((t) => (
          <Link key={t} href={`/buscar?q=${encodeURIComponent(t)}`} className="chip transition hover:border-ouro-400/40 hover:text-white">
            {t}
          </Link>
        ))}
      </div>
    </div>
  );
}

export async function Vizinhos({ id }: { id: string }) {
  const item = (await getItem(id))!;
  const lista = await itensDoPilar(item.pilar, item.tipo);
  const n = lista.findIndex((i) => i.id === id);
  const ant = lista[n - 1];
  const prox = lista[n + 1];
  if (!ant && !prox) return null;
  return (
    <nav className="nao-imprimir mt-8 grid gap-3 sm:grid-cols-2">
      {ant ? (
        <Link href={rota(ant)} className="vidro-interativo group p-4">
          <span className="flex items-center gap-1 text-xs font-semibold text-white/40">
            <Icone nome="voltar" className="h-3.5 w-3.5" /> Anterior
          </span>
          <span className="mt-1 line-clamp-2 block font-semibold text-white/85 group-hover:text-white">{ant.titulo}</span>
        </Link>
      ) : (
        <span />
      )}
      {prox && (
        <Link href={rota(prox)} className="vidro-interativo group p-4 text-right">
          <span className="flex items-center justify-end gap-1 text-xs font-semibold text-white/40">
            Próximo <Icone nome="seta" className="h-3.5 w-3.5" />
          </span>
          <span className="mt-1 line-clamp-2 block font-semibold text-white/85 group-hover:text-white">{prox.titulo}</span>
        </Link>
      )}
    </nav>
  );
}

export default async function Artigo({ id, tipo }: { id: string; tipo: Tipo }) {
  const { item } = await cabecalhoItem(id, tipo);
  const { html, secoes } = renderizar(item.corpo);
  return (
    <div className="container-site pt-2 lg:pt-0">
      <BarraLeitura />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_17rem] xl:gap-10">
        <article className="min-w-0">
          <Cabecalho id={id} tipo={tipo} />
          <div className="vidro mt-8 px-5 py-2 sm:px-9 sm:py-4">
            <div className="conteudo-guia" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
          <div className="nao-imprimir mt-6">
            <BotaoConcluir id={id} grande />
          </div>
          <Tags id={id} />
          <Vizinhos id={id} />
        </article>
        <Lateral id={id} secoes={secoes} />
      </div>
    </div>
  );
}

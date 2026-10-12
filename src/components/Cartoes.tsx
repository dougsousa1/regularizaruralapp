import Link from "next/link";
import { getPilar, rotaDoItem, TIPOS, type Tipo } from "@/lib/pilares";
import Icone from "./Icone";

type ItemCartao = { id: string; titulo: string; pilar: string; tipo: Tipo; resumo: string };

export const COR_TIPO: Record<Tipo, string> = {
  guia: "border-ouro-400/25 bg-ouro-400/10 text-ouro-300",
  fluxo: "border-mata-400/30 bg-mata-500/15 text-mata-300",
  checklist: "border-sky-300/20 bg-sky-400/10 text-sky-200",
  referencia: "border-violet-300/20 bg-violet-400/10 text-violet-200",
};

export function IconeTipo({ tipo, tamanho = "h-10 w-10" }: { tipo: Tipo; tamanho?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-xl border ${COR_TIPO[tipo]} ${tamanho}`}>
      <Icone nome={tipo} className="h-[18px] w-[18px]" />
    </span>
  );
}

export function CartaoItem({
  item,
  mostrarPilar = false,
  compacto = false,
}: {
  item: ItemCartao;
  mostrarPilar?: boolean;
  compacto?: boolean;
}) {
  return (
    <Link href={rotaDoItem(item.tipo, item.id)} className="vidro-interativo group flex gap-4 p-4">
      <IconeTipo tipo={item.tipo} />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold leading-snug text-white transition group-hover:text-ouro-100">
          {item.titulo}
        </span>
        {mostrarPilar && (
          <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-wider text-white/35">
            {TIPOS[item.tipo].nome} · {getPilar(item.pilar)?.nome}
          </span>
        )}
        {!compacto && <span className="mt-1.5 line-clamp-2 block text-sm leading-relaxed text-white/50">{item.resumo}</span>}
      </span>
      <Icone
        nome="seta"
        className="mt-1 h-4 w-4 shrink-0 -translate-x-1 text-white/20 transition group-hover:translate-x-0 group-hover:text-ouro-300"
      />
    </Link>
  );
}

export function Trilha({ partes }: { partes: { href?: string; rotulo: string }[] }) {
  return (
    <nav aria-label="Caminho" className="nao-imprimir mb-5 flex flex-wrap items-center gap-1.5 text-[13px] text-white/40">
      <Link href="/" className="transition hover:text-white">
        Início
      </Link>
      {partes.map((p) => (
        <span key={p.rotulo} className="flex items-center gap-1.5">
          <span aria-hidden="true" className="text-white/20">
            /
          </span>
          {p.href ? (
            <Link href={p.href} className="transition hover:text-white">
              {p.rotulo}
            </Link>
          ) : (
            <span className="text-white/70">{p.rotulo}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function SeloRevisao({ revisao }: { revisao: string }) {
  if (revisao === "revisado") {
    return (
      <span className="chip border-mata-400/30 bg-mata-500/15 text-mata-200">
        <Icone nome="check" className="h-3 w-3" />
        Revisado pela mentora
      </span>
    );
  }
  return (
    <span className="chip border-ouro-400/25 bg-ouro-400/10 text-ouro-200" title="Extraído das aulas, ainda não conferido pela mentora">
      <span className="h-1.5 w-1.5 rounded-full bg-ouro-300" />
      Aguardando revisão
    </span>
  );
}

export function SeloTipo({ tipo }: { tipo: Tipo }) {
  return (
    <span className={`chip ${COR_TIPO[tipo]}`}>
      <Icone nome={tipo} className="h-3.5 w-3.5" />
      {TIPOS[tipo].nome}
    </span>
  );
}

export function TituloSecao({
  rotulo,
  titulo,
  descricao,
  acao,
}: {
  rotulo?: string;
  titulo: string;
  descricao?: string;
  acao?: { href: string; texto: string };
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {rotulo && <p className="rotulo mb-1.5">{rotulo}</p>}
        <h2 className="titulo-display text-xl sm:text-2xl">{titulo}</h2>
        {descricao && <p className="mt-1 text-sm text-white/50">{descricao}</p>}
      </div>
      {acao && (
        <Link href={acao.href} className="shrink-0 text-sm font-semibold text-ouro-300 transition hover:text-ouro-200">
          {acao.texto} →
        </Link>
      )}
    </div>
  );
}

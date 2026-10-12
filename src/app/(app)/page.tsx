import Image from "next/image";
import Link from "next/link";
import { CartaoItem, TituloSecao } from "@/components/Cartoes";
import Icone from "@/components/Icone";
import { BuscaHero, PainelAluno, ProgressoPilar } from "@/components/Painel";
import { catalogo, itensDoPilar, itensDoTipo, resumo, todosItens } from "@/lib/conteudo";
import { PILARES } from "@/lib/pilares";

const ATALHOS = [
  "preço do arrendamento",
  "CCIR de posse",
  "uso consolidado",
  "ITR reserva legal",
  "usucapião extrajudicial",
  "certidões do vendedor",
  "estrangeiro comprar terra",
];

export default function Inicio() {
  const total = todosItens().length;
  const fluxos = itensDoTipo("fluxo");
  const cat = new Map(catalogo().map((c) => [c.id, c]));
  const sugestoes = PILARES.map((p) => (p.comeceAqui ? cat.get(p.comeceAqui) : undefined)).filter(
    (i): i is NonNullable<typeof i> => !!i,
  );

  const numeros: [number, string][] = [
    [total, "conteúdos"],
    [fluxos.length, "fluxos de decisão"],
    [itensDoTipo("checklist").length, "checklists"],
    [PILARES.length, "pilares"],
  ];

  return (
    <div className="container-site space-y-14 pt-2 lg:pt-0">
      {/* Destaque */}
      <section className="relative isolate overflow-hidden rounded-[28px] border border-white/[0.08] bg-noite-950 shadow-2xl shadow-black/50 animate-surgir">
        <div className="absolute inset-x-0 top-0 -z-10 h-80 sm:h-[26rem] lg:inset-y-0 lg:left-[38%] lg:h-auto">
          <Image
            src="/img/priscila-campo.webp"
            alt="Priscila no campo de trigo ao pôr do sol"
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover object-[46%_18%] opacity-80 lg:object-[62%_20%] lg:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-noite-950 via-noite-950/30 to-transparent lg:bg-gradient-to-r lg:from-noite-950 lg:via-noite-950/40 lg:to-transparent" />
        </div>
        <div className="pointer-events-none absolute -left-24 -top-24 -z-10 h-72 w-72 rounded-full bg-mata-500/20 blur-3xl animate-brilho" />

        <div className="relative px-5 pb-6 pt-56 sm:px-8 sm:pt-72 lg:max-w-[58%] lg:px-12 lg:py-14">
          <p className="rotulo flex items-center gap-2">
            <span className="h-px w-6 bg-ouro-400" /> Vitalício · Central de consulta
          </p>
          <h1 className="titulo-display mt-4 text-[2rem] leading-[1.05] sm:text-5xl">
            Chegou com um caso?
            <span className="texto-ouro block pb-1">Resposta em segundos.</span>
          </h1>
          <p className="mt-4 hidden max-w-md text-[15px] leading-relaxed text-white/60 sm:block">
            Todo o método do Regulariza Rural organizado para consulta no dia a dia: guias, checklists de
            atendimento, fluxos de decisão e tabelas.
          </p>
          <div className="mt-7 max-w-xl">
            <BuscaHero atalhos={ATALHOS} />
          </div>
          <dl className="mt-8 grid max-w-lg grid-cols-4 gap-2">
            {numeros.map(([n, r]) => (
              <div key={r} className="rounded-xl border border-white/[0.07] bg-white/[0.04] px-2 py-2.5 text-center backdrop-blur sm:px-3">
                <dd className="font-display text-lg font-bold text-white sm:text-2xl">{n}</dd>
                <dt className="text-[10px] leading-tight text-white/45 sm:text-[11px]">{r}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <PainelAluno sugestoes={sugestoes} />

      {/* Pilares */}
      <section id="pilares" className="scroll-mt-20">
        <TituloSecao rotulo="Trilhas" titulo="Pilares da mentoria" descricao="Escolha a área do problema." />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {PILARES.map((p, n) => {
            const itens = itensDoPilar(p.slug);
            const estudo = itens.filter((i) => i.tipo === "guia" || i.tipo === "referencia").map((i) => i.id);
            return (
              <Link
                key={p.slug}
                href={`/pilar/${p.slug}`}
                className="vidro-interativo group relative flex flex-col overflow-hidden p-5 animate-surgir"
                style={{ animationDelay: `${n * 50}ms` }}
              >
                <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-ouro-400/10 opacity-0 blur-2xl transition group-hover:opacity-100" />
                <div className="flex items-start justify-between">
                  <span className="icone-caixa h-12 w-12">
                    <Icone nome={p.icone} className="h-6 w-6" />
                  </span>
                  <span className="text-[11px] font-semibold tabular-nums text-white/30">
                    {String(n + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="titulo-display mt-5 text-lg">{p.nome}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/50">{p.descricao}</p>
                <div className="mt-auto pt-5">
                  <ProgressoPilar ids={estudo} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Fluxos */}
      <section>
        <TituloSecao
          rotulo="Decida pelo caso concreto"
          titulo="Fluxos de decisão"
          descricao="Responda algumas perguntas e chegue ao caminho certo."
          acao={{ href: "/fluxos", texto: "Ver todos" }}
        />
        <div className="grid gap-3 md:grid-cols-2">
          {fluxos.slice(0, 6).map((f) => (
            <CartaoItem key={f.id} item={resumo(f)} mostrarPilar />
          ))}
        </div>
      </section>

      {/* Ferramentas */}
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { href: "/checklists", icone: "checklist", titulo: "Checklists", texto: "Para usar durante o atendimento" },
          { href: "/referencias", icone: "referencia", titulo: "Tabelas", texto: "Prazos, percentuais e siglas" },
          { href: "/salvos", icone: "salvo", titulo: "Meus salvos", texto: "Favoritos, histórico e progresso" },
        ].map((f) => (
          <Link key={f.href} href={f.href} className="vidro-interativo group flex items-center gap-4 p-5">
            <span className="icone-caixa h-11 w-11">
              <Icone nome={f.icone} className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-semibold text-white">{f.titulo}</span>
              <span className="text-sm text-white/45">{f.texto}</span>
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}

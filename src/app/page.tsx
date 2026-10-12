import Link from "next/link";
import BotaoBusca from "@/components/BotaoBusca";
import { CartaoItem } from "@/components/Cartoes";
import Icone from "@/components/Icone";
import { itensDoPilar, itensDoTipo, resumo, todosItens } from "@/lib/conteudo";
import { PILARES } from "@/lib/pilares";

const ATALHOS = [
  "preço do arrendamento",
  "CCIR de posse",
  "uso consolidado",
  "ITR área de reserva legal",
  "usucapião extrajudicial",
  "certidões do vendedor",
];

export default function Inicio() {
  const total = todosItens().length;
  const fluxos = itensDoTipo("fluxo");
  const checklists = itensDoTipo("checklist").length;
  const referencias = itensDoTipo("referencia").length;

  return (
    <>
      <section className="border-b border-stone-200 bg-gradient-to-b from-mata-50 to-[#fbfaf7]">
        <div className="container-site py-14 sm:py-20">
          <p className="text-sm font-medium uppercase tracking-wider text-mata-700">
            Direito agrário e regularização rural
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-tight text-stone-900 sm:text-5xl">
            Chegou com um caso? Encontre a resposta em segundos.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-600">
            Todo o método da mentoria organizado para consulta: guias práticos, checklists para usar no
            atendimento, fluxos que decidem com você e tabelas de prazos e percentuais.
          </p>
          <div className="mt-8 max-w-2xl">
            <BotaoBusca grande />
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {ATALHOS.map((a) => (
                <Link
                  key={a}
                  href={`/buscar?q=${encodeURIComponent(a)}`}
                  className="rounded-full border border-stone-200 bg-white px-3 py-1 text-stone-600 hover:border-mata-400 hover:text-mata-800"
                >
                  {a}
                </Link>
              ))}
            </div>
          </div>
          <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              [total, "conteúdos"],
              [fluxos.length, "fluxos de decisão"],
              [checklists, "checklists"],
              [referencias, "tabelas e glossários"],
            ].map(([n, r]) => (
              <div key={r}>
                <dt className="sr-only">{r}</dt>
                <dd className="text-2xl font-semibold text-mata-800">{n}</dd>
                <dd className="text-sm text-stone-500">{r}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="pilares" className="container-site scroll-mt-20 py-12">
        <h2 className="text-2xl font-semibold text-stone-900">Pilares da mentoria</h2>
        <p className="mt-1 text-stone-600">Escolha a área do problema para ver tudo o que existe sobre ela.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILARES.map((p) => (
            <Link
              key={p.slug}
              href={`/pilar/${p.slug}`}
              className="group rounded-2xl border border-stone-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-mata-300 hover:shadow-md"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-mata-100 text-mata-700 group-hover:bg-mata-700 group-hover:text-white">
                <Icone nome={p.icone} className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-stone-900">{p.nome}</h3>
              <p className="mt-1 text-sm text-stone-600">{p.descricao}</p>
              <p className="mt-4 text-xs font-medium text-mata-700">{itensDoPilar(p.slug).length} conteúdos →</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-site py-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-stone-900">Decida pelo caso concreto</h2>
            <p className="mt-1 text-stone-600">
              Responda algumas perguntas e chegue ao caminho certo, com os guias para aprofundar.
            </p>
          </div>
          <Link href="/fluxos" className="hidden shrink-0 text-sm font-medium text-mata-700 sm:block">
            Todos os fluxos →
          </Link>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fluxos.slice(0, 9).map((f) => (
            <CartaoItem key={f.id} item={resumo(f)} mostrarPilar />
          ))}
        </div>
        <Link href="/fluxos" className="mt-4 block text-sm font-medium text-mata-700 sm:hidden">
          Todos os fluxos →
        </Link>
      </section>
    </>
  );
}

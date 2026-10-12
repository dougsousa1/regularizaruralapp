type Props = { nome: string; className?: string; cheio?: boolean };

const caminhos: Record<string, string> = {
  contrato:
    "M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 0v5h5M9 13h6M9 17h6M9 9h2",
  mapa: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14",
  lupa: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4-4",
  ficha: "M4 5h16v14H4zM8 9h8M8 13h8M8 17h4",
  moeda: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm3 6.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v12",
  folha: "M5 19c0-8 5-13 15-14-1 10-6 15-14 15H5Zm0 0 8-8",
  estrela: "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z",
  guia: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Zm0 16a2 2 0 0 1 2-2h13v2H6",
  checklist: "M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2",
  fluxo: "M6 3v6m0 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 6h6a3 3 0 0 1 3 3v6m0 0a3 3 0 1 0 0-6M18 3v6",
  referencia: "M4 4h16v16H4zM4 10h16M10 4v16",
  busca: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4-4",
  seta: "M5 12h14m-6-6 6 6-6 6",
  voltar: "M19 12H5m6 6-6-6 6-6",
  imprimir: "M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7z",
  copiar: "M9 9h11v11H9zM5 15H4V4h11v1",
  recomecar: "M4 4v6h6M20 20v-6h-6M5 15a7 7 0 0 0 13 2M19 9A7 7 0 0 0 6 7",
  alerta: "M12 9v4m0 4h.01M10.3 3.9 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
  livro: "M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2Zm0 0v14",
  inicio: "M3 10.5 12 3l9 7.5M5 9v11h5v-6h4v6h5V9",
  grade: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  salvo: "M6 3h12v18l-6-4-6 4V3Z",
  check: "m5 12 5 5L20 7",
  relogio: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3 2",
  fechar: "M6 6l12 12M18 6 6 18",
  escudo: "M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Zm-3 9 2 2 4-4",
  raio: "M13 2 4 14h7l-1 8 9-12h-7l1-8Z",
  mais: "M12 5v14M5 12h14",
};

export default function Icone({ nome, className = "h-5 w-5", cheio = false }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={cheio ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={caminhos[nome] ?? caminhos.guia} />
    </svg>
  );
}

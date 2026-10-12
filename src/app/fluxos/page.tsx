import ListaPorPilar from "@/components/ListaPorPilar";

export const metadata = { title: "Fluxos de decisão" };

export default function Pagina() {
  return (
    <ListaPorPilar
      tipo="fluxo"
      descricao="Perguntas e respostas que levam ao caminho certo no caso concreto: qual contrato usar, qual espécie de usucapião, se o imóvel paga IPTU ou ITR e muito mais."
    />
  );
}

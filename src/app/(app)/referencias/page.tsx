import ListaPorPilar from "@/components/ListaPorPilar";

export const metadata = { title: "Tabelas e referências" };

export default function Pagina() {
  return (
    <ListaPorPilar
      tipo="referencia"
      descricao="Prazos, percentuais, medidas, órgãos, onde tirar cada certidão e glossários de siglas — para consulta rápida."
    />
  );
}

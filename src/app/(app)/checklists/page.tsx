import ListaPorPilar from "@/components/ListaPorPilar";

export const metadata = { title: "Checklists" };

export default function Pagina() {
  return (
    <ListaPorPilar
      tipo="checklist"
      descricao="Listas para usar durante o atendimento: marque o que já foi feito, imprima ou copie as pendências para enviar ao cliente."
    />
  );
}

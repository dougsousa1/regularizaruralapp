import { Suspense } from "react";
import FormEntrar from "./FormEntrar";

export const metadata = { title: "Entrar" };

export default function Pagina() {
  return (
    <Suspense>
      <FormEntrar />
    </Suspense>
  );
}

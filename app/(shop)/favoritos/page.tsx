import type { Metadata } from "next";
import { PageHeader } from "@/components/templates/PageHeader";
import { RackView } from "@/features/favorites/RackView";

export const metadata: Metadata = {
  title: "Mi rack",
  description: "Tus favoritos en un estante: el total para llevarte todo, armar tu stack con ellos y el aviso si baja el precio o vuelve el stock.",
};

/** Mi rack (R2c): los favoritos de este navegador como el estante propio. La ruta sigue siendo /favoritos/. */
export default function MyRackPage() {
  return (
    <>
      <PageHeader title="Mi rack">Lo que guardaste con el corazón, en tu estante: cuánto sale llevarte todo, tu stack con estos potes y el aviso si algo baja o vuelve. Se guarda en este navegador.</PageHeader>
      <RackView />
    </>
  );
}

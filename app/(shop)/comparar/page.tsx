import type { Metadata } from "next";
import { PageHeader } from "@/components/templates/PageHeader";
import { CompareView } from "@/features/compare/CompareView";

export const metadata: Metadata = { title: "Comparador", description: "Hasta 3 productos lado a lado: precio, precio por servicio, proteína, servicios y vencimiento." };

export default function ComparePage() {
  return (
    <>
      <PageHeader title="Comparador" crumbs={[{ href: "/categorias/", label: "Tienda" }]}>
        Lo que pagás, lo que rinde y cuándo vence, lado a lado. La respuesta a “¿cuál me conviene?”.
      </PageHeader>
      <CompareView />
    </>
  );
}

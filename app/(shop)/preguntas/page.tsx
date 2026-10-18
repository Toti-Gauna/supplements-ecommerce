import type { Metadata } from "next";
import { PageHeader } from "@/components/templates/PageHeader";
import { HelpView } from "@/features/help/HelpView";
import { OwnerSpot } from "@/features/owner/OwnerSpot";

export const metadata: Metadata = {
  title: "Ayuda del box",
  description: "Preguntas frecuentes por tema (compras, envíos y cadete, pagos, cambios, suplementos y lotes, equipamiento y talles, club y regalos) con buscador, y el WhatsApp del local.",
};

/** Ayuda del box (R2c): preguntas frecuentes agrupadas por tema, con buscador y contacto con el local. */
export default function HelpPage() {
  return (
    <>
      <PageHeader title="Ayuda del box">Preguntas frecuentes por tema. Buscá con tus palabras (sin tildes también) y, si no está, preguntale al local.</PageHeader>
      <OwnerSpot id="preguntas" />
      <HelpView />
    </>
  );
}

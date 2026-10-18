import type { Metadata } from "next";
import { PageHeader } from "@/components/templates/PageHeader";
import { GoalRail } from "@/features/home/GoalRail";
import { OwnerSpot } from "@/features/owner/OwnerSpot";
import { StackBuilder } from "@/features/stack/StackBuilder";

export const metadata: Metadata = {
  title: "Armá tu stack",
  description: "Elegí hasta tres objetivos (y tu deporte, si querés) y armá tu stack de suplementos: proteína, creatina, pre-entreno y un extra, con el descuento stack y lo que te sale por día.",
};

/** Armador de stack (Fase 3): objetivo, cuatro lugares, estante en vivo y resumen con el descuento del carrito. */
export default function StackPage() {
  return (
    <>
      <StackBuilder intro={<><PageHeader title="Armá tu stack">Combiná hasta tres objetivos, sumá tu deporte si querés y mirá cómo se arma tu estante, con el descuento stack.</PageHeader><OwnerSpot id="stack" /></>} />
      <section aria-labelledby="explore-goals-title" className="mt-16 sm:mt-24">
        <p className="eyebrow text-volt-ink">Por objetivo</p>
        <h2 id="explore-goals-title" className="font-display mb-6 mt-2 text-3xl sm:text-4xl">O explorá por objetivo</h2>
        <GoalRail heading={false} />
      </section>
    </>
  );
}

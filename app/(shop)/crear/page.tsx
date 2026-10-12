import type { Metadata } from "next";
import { PageHeader } from "@/components/templates/PageHeader";
import { GoalRail } from "@/features/home/GoalRail";
import { StackBuilder } from "@/features/stack/StackBuilder";

export const metadata: Metadata = {
  title: "Armá tu stack",
  description: "Elegí tu objetivo y armá tu stack de suplementos: proteína, creatina, pre-entreno y un extra, con el descuento stack y lo que te sale por día.",
};

/** Armador de stack (Fase 3): objetivo, cuatro lugares, estante en vivo y resumen con el descuento del carrito. */
export default function StackPage() {
  return (
    <>
      <StackBuilder intro={<PageHeader title="Armá tu stack">Elegí tu objetivo y mirá cómo se arma tu estante, con el descuento stack.</PageHeader>} />
      <section aria-labelledby="explore-goals-title" className="mt-16 sm:mt-24">
        <p className="eyebrow text-volt-ink">Por objetivo</p>
        <h2 id="explore-goals-title" className="font-display mb-6 mt-2 text-3xl sm:text-4xl">O explorá por objetivo</h2>
        <GoalRail heading={false} />
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { PageHeader } from "@/components/templates/PageHeader";
import { GoalRail } from "@/features/home/GoalRail";

export const metadata: Metadata = { title: "Entrená por objetivo", description: "Elegí tu objetivo y mirá los suplementos que te sirven: masa muscular, fuerza, energía, recuperación, definición, resistencia y salud." };

/** Entrada por objetivo. En la Fase 3 suma el armador de stack y el quiz (docs/plan-por-fases.md). */
export default function GoalsPage() {
  return (
    <>
      <PageHeader title="Entrená por objetivo">
        Elegí qué querés lograr y te mostramos los suplementos que te sirven, del más elegido al menos.
      </PageHeader>
      <GoalRail heading={false} />
    </>
  );
}

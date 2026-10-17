import type { ComponentType } from "react";
import type { Goal } from "@/demo/types";
import { cn } from "@/lib/cn";
import { Energia, Recuperacion, Resistencia, Salud } from "./goals/flow";
import { Definicion, Fuerza, MasaMuscular } from "./goals/strength";

/** Una pose con su equipo por objetivo, en una grilla de 120 × 200 con el piso en y = 190. Sin caras: solo la silueta. */
export const GOAL_ART: Record<Goal, ComponentType> = {
  "masa-muscular": MasaMuscular,
  fuerza: Fuerza,
  energia: Energia,
  recuperacion: Recuperacion,
  definicion: Definicion,
  salud: Salud,
  resistencia: Resistencia,
};

/**
 * Silueta de atleta (sin cara) para los paneles de objetivo y la escena del carrusel: trazo grueso redondeado, como
 * una figura recortada contra la luz del box, con su equipo (barra, mancuernas, sogas, rolo, soga de saltar, ruta,
 * colchoneta). Toma `currentColor`; el equipo y el fondo van más tenues.
 */
export function AthleteSilhouette({ goal, className }: { goal: Goal; className?: string }) {
  const Art = GOAL_ART[goal] ?? GOAL_ART.fuerza;
  return (
    <svg viewBox="0 0 120 200" aria-hidden="true" focusable="false" className={cn("block", className)}
      fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <Art />
    </svg>
  );
}

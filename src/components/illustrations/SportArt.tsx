import type { ComponentType } from "react";
import type { SportId } from "@/demo/types";
import { Basquet, Futbol, Rugby, Voley } from "./sports/ball-sports";
import { Ciclismo, Natacion, Running } from "./sports/endurance";
import { Boxeo, Crossfit } from "./sports/gym-sports";
import { Hockey, Padel, Tenis } from "./sports/racket-sports";
import { Stage } from "./sports/stage";

/** Una escena por deporte: atleta sin cara en plena acción con el equipo que lo identifica de un vistazo. */
export const SPORT_ART: Record<SportId, ComponentType> = {
  futbol: Futbol,
  tenis: Tenis,
  padel: Padel,
  running: Running,
  ciclismo: Ciclismo,
  natacion: Natacion,
  boxeo: Boxeo,
  crossfit: Crossfit,
  basquet: Basquet,
  rugby: Rugby,
  hockey: Hockey,
  voley: Voley,
};

/**
 * Ilustración de un deporte (para "Entrená por objetivo" y el quiz). Lienzo común de 160 × 200 para que todas queden
 * alineadas en grilla; dibuja en `currentColor` (el contenedor elige el tono con `text-…`) y es decorativa.
 */
export function SportArt({ sport, className }: { sport: SportId; className?: string }) {
  const Scene = SPORT_ART[sport] ?? SPORT_ART.running;
  return (
    <Stage className={className}>
      <Scene />
    </Stage>
  );
}

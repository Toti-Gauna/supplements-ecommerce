import dynamic from "next/dynamic";
import type { OpeningScene } from "@/demo/engine/gift-opening";
import type { OpeningArt } from "../stage/types";
import Original from "./original";

/** Cada escena baja recién cuando se abre un regalo de esa fecha (unos KB): mientras, se ve el escenario vacío. */
const lazy = (load: () => Promise<{ default: OpeningArt }>) => dynamic(load, { ssr: false, loading: () => null }) as OpeningArt;

/**
 * Registro de escenas de apertura, una por fecha (punto 11 de Ignacio), cada una en su archivo sobre el escenario
 * común (`stage/`). Exhaustivo sobre `OpeningScene`: una fecha nueva no compila sin su apertura. Qué escena le toca
 * a un regalo lo decide `selectOpening` (motor, con tests).
 */
export const OPENING_ARTS: Record<OpeningScene, OpeningArt> = {
  original: Original,
  "dia-de-la-madre": lazy(() => import("./dia-de-la-madre")),
  halloween: lazy(() => import("./halloween")),
  "cyber-monday": lazy(() => import("./cyber-monday")),
  "black-friday": lazy(() => import("./black-friday")),
  navidad: lazy(() => import("./navidad")),
  "ano-nuevo": lazy(() => import("./ano-nuevo")),
  "san-valentin": lazy(() => import("./san-valentin")),
  "vuelta-al-gym": lazy(() => import("./vuelta-al-gym")),
  "hot-sale": lazy(() => import("./hot-sale")),
  "dia-del-padre": lazy(() => import("./dia-del-padre")),
  "dia-del-amigo": lazy(() => import("./dia-del-amigo")),
  "operacion-verano": lazy(() => import("./operacion-verano")),
  "crossfit-open": lazy(() => import("./crossfit-open")),
  "dia-actividad-fisica": lazy(() => import("./dia-actividad-fisica")),
  "dia-del-futbolista": lazy(() => import("./dia-del-futbolista")),
  "dia-del-running": lazy(() => import("./dia-del-running")),
  "dia-del-boxeador": lazy(() => import("./dia-del-boxeador")),
};

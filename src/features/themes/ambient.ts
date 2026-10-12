import type { DecorKind } from "@/components/illustrations/seasonal/Decor";
import type { SeasonId } from "@/demo/types";

/** Partícula del fondo animado: una decoración, un punto de luz o un papelito. */
export type Particle = { decor: DecorKind } | { dot: string } | { paper: string };

export interface AmbientLayer {
  particles: Particle[];
  /** fall: cae · rise: sube · drift: cruza de izquierda a derecha · twinkle: titila en su lugar. */
  motion: "fall" | "rise" | "drift" | "twinkle";
  count: number;
  /** Tamaño en px [mín, máx] y duración de una pasada en segundos [mín, máx]. */
  size: [number, number];
  duration: [number, number];
  opacity: number;
}

const SNOW = "var(--amb-snow)";
const VOLT = "#c8ff2e";

/** Fondo animado de cada temática (capas). En la página es sutil; en el splash y el banner se usa más denso. */
export const AMBIENT: Record<SeasonId, AmbientLayer[]> = {
  "dia-de-la-madre": [
    { particles: [{ paper: "#f5a8c6" }, { paper: "#ffd1e3" }, { paper: "#e4577a" }], motion: "fall", count: 16, size: [7, 11], duration: [12, 20], opacity: 0.7 },
    { particles: [{ decor: "heart" }], motion: "rise", count: 5, size: [12, 18], duration: [16, 24], opacity: 0.5 },
  ],
  halloween: [
    { particles: [{ decor: "bat" }], motion: "drift", count: 5, size: [26, 44], duration: [14, 22], opacity: 0.6 },
    { particles: [{ dot: "#ff9a3c" }, { dot: "#a6ff4d" }], motion: "twinkle", count: 16, size: [3, 6], duration: [3, 6], opacity: 0.85 },
  ],
  "cyber-monday": [
    { particles: [{ dot: "#3ff0e0" }, { dot: "#ff4fd8" }], motion: "twinkle", count: 22, size: [2, 5], duration: [2, 4], opacity: 0.85 },
    { particles: [{ decor: "chip" }], motion: "rise", count: 4, size: [14, 22], duration: [18, 26], opacity: 0.35 },
  ],
  "black-friday": [{ particles: [{ dot: VOLT }, { decor: "spark" }], motion: "twinkle", count: 18, size: [4, 12], duration: [3, 6], opacity: 0.8 }],
  navidad: [
    { particles: [{ dot: SNOW }], motion: "fall", count: 26, size: [3, 8], duration: [11, 20], opacity: 0.9 },
    { particles: [{ decor: "snowflake" }], motion: "fall", count: 5, size: [14, 22], duration: [16, 24], opacity: 0.55 },
  ],
  "ano-nuevo": [
    { particles: [{ paper: "#e3ff8f" }, { paper: VOLT }, { paper: "#8b72ff" }, { paper: "#2ee6d6" }], motion: "fall", count: 22, size: [6, 11], duration: [9, 16], opacity: 0.85 },
    { particles: [{ decor: "spark" }], motion: "twinkle", count: 7, size: [10, 18], duration: [3, 5], opacity: 0.8 },
  ],
  "san-valentin": [{ particles: [{ decor: "heart" }], motion: "rise", count: 12, size: [12, 26], duration: [14, 22], opacity: 0.55 }],
  "vuelta-al-gym": [
    { particles: [{ dot: VOLT }, { dot: "#b3a4ff" }], motion: "rise", count: 16, size: [3, 6], duration: [8, 14], opacity: 0.8 },
    { particles: [{ decor: "bolt" }], motion: "twinkle", count: 5, size: [12, 18], duration: [3, 5], opacity: 0.6 },
  ],
  "hot-sale": [{ particles: [{ dot: "#ff8a3c" }, { dot: "#ffd34d" }], motion: "rise", count: 20, size: [3, 7], duration: [7, 13], opacity: 0.85 }],
  "dia-del-padre": [{ particles: [{ decor: "spark" }, { dot: "#ffcf5c" }], motion: "twinkle", count: 12, size: [4, 12], duration: [3, 6], opacity: 0.6 }],
  "dia-del-amigo": [
    { particles: [{ paper: "#e3ff8f" }, { paper: "#5ee8da" }, { paper: "#ffffff" }], motion: "fall", count: 16, size: [6, 10], duration: [11, 18], opacity: 0.7 },
    { particles: [{ decor: "spark" }], motion: "twinkle", count: 5, size: [10, 16], duration: [3, 5], opacity: 0.6 },
  ],
  "operacion-verano": [
    { particles: [{ dot: "#ffffff" }, { dot: "#bfefff" }], motion: "rise", count: 16, size: [3, 8], duration: [12, 20], opacity: 0.6 },
    { particles: [{ dot: "#ffd34d" }], motion: "twinkle", count: 8, size: [3, 6], duration: [3, 5], opacity: 0.75 },
  ],
};

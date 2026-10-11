import type { DecorKind } from "@/components/illustrations/seasonal/Decor";
import { CELESTE } from "@/components/illustrations/seasonal/patrias";
import { PRIDE } from "@/components/illustrations/seasonal/pride";
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

/** Fondo animado de cada temática (capas). En la página es sutil; en el splash y el banner se usa más denso. */
export const AMBIENT: Record<SeasonId, AmbientLayer[]> = {
  navidad: [
    { particles: [{ dot: SNOW }], motion: "fall", count: 26, size: [3, 8], duration: [11, 20], opacity: 0.9 },
    { particles: [{ decor: "snowflake" }], motion: "fall", count: 5, size: [14, 22], duration: [16, 24], opacity: 0.55 },
  ],
  halloween: [
    { particles: [{ decor: "bat" }], motion: "drift", count: 5, size: [26, 44], duration: [14, 22], opacity: 0.6 },
    { particles: [{ dot: "#ff9a3c" }, { dot: "#c58bff" }], motion: "twinkle", count: 16, size: [3, 6], duration: [3, 6], opacity: 0.85 },
  ],
  "ano-nuevo": [
    { particles: [{ paper: "#f3dca6" }, { paper: "#d2ad69" }, { paper: "#8fd3ff" }, { paper: "#ff7aa8" }], motion: "fall", count: 22, size: [6, 11], duration: [9, 16], opacity: 0.85 },
    { particles: [{ decor: "star" }], motion: "twinkle", count: 7, size: [10, 18], duration: [3, 5], opacity: 0.8 },
  ],
  "san-valentin": [{ particles: [{ decor: "heart" }], motion: "rise", count: 12, size: [12, 26], duration: [14, 22], opacity: 0.55 }],
  orgullo: [
    { particles: PRIDE.map((c) => ({ paper: c })), motion: "fall", count: 24, size: [6, 11], duration: [10, 17], opacity: 0.85 },
    { particles: [{ decor: "pride-heart" }], motion: "rise", count: 6, size: [14, 22], duration: [15, 23], opacity: 0.55 },
  ],
  "revolucion-de-mayo": [
    { particles: [{ paper: CELESTE }, { paper: "#ffffff" }], motion: "fall", count: 16, size: [6, 10], duration: [11, 18], opacity: 0.7 },
    { particles: [{ decor: "escarapela" }], motion: "fall", count: 5, size: [16, 24], duration: [16, 24], opacity: 0.6 },
  ],
  "dia-de-la-bandera": [
    { particles: [{ paper: CELESTE }, { paper: "#ffffff" }, { paper: "#f6cf5a" }], motion: "fall", count: 20, size: [6, 10], duration: [10, 17], opacity: 0.75 },
    { particles: [{ dot: "#f6cf5a" }], motion: "twinkle", count: 8, size: [3, 6], duration: [3, 5], opacity: 0.7 },
  ],
  "dia-de-la-independencia": [
    { particles: [{ dot: "#bfe3fb" }, { dot: "#ffffff" }, { dot: "#f3d27a" }], motion: "twinkle", count: 18, size: [3, 6], duration: [3, 6], opacity: 0.85 },
    { particles: [{ decor: "star" }], motion: "twinkle", count: 6, size: [10, 16], duration: [3, 5], opacity: 0.7 },
  ],
  pascuas: [
    { particles: [{ paper: "#f7b6c8" }, { paper: "#ffe28a" }, { paper: "#b9e3f5" }, { paper: "#cdb3f5" }], motion: "fall", count: 16, size: [7, 11], duration: [12, 20], opacity: 0.75 },
    { particles: [{ decor: "easter-egg" }], motion: "fall", count: 4, size: [16, 22], duration: [18, 26], opacity: 0.6 },
  ],
  "dia-del-animal": [
    { particles: [{ decor: "paw" }], motion: "rise", count: 9, size: [14, 24], duration: [16, 24], opacity: 0.45 },
    { particles: [{ decor: "bone" }], motion: "rise", count: 4, size: [16, 24], duration: [18, 26], opacity: 0.4 },
  ],
  "hot-sale": [{ particles: [{ dot: "#ff8a3c" }, { dot: "#ffd34d" }], motion: "rise", count: 20, size: [3, 7], duration: [7, 13], opacity: 0.85 }],
  "black-friday": [{ particles: [{ dot: "#f3dca6" }, { decor: "star" }], motion: "twinkle", count: 18, size: [4, 12], duration: [3, 6], opacity: 0.8 }],
  "dia-del-padre": [{ particles: [{ decor: "star" }, { dot: "#e9c27a" }], motion: "twinkle", count: 12, size: [4, 12], duration: [3, 6], opacity: 0.6 }],
  "dia-del-amigo": [{ particles: [{ paper: "#f3dca6" }, { paper: "#b7d68f" }, { paper: "#ef9b6a" }], motion: "fall", count: 16, size: [6, 10], duration: [11, 18], opacity: 0.7 }],
  "dia-del-nino": [
    { particles: [{ decor: "balloon" }], motion: "rise", count: 7, size: [20, 34], duration: [14, 22], opacity: 0.6 },
    { particles: [{ paper: "#ffd34d" }, { paper: "#4fb3e8" }, { paper: "#ef5b5b" }], motion: "fall", count: 12, size: [6, 10], duration: [11, 18], opacity: 0.7 },
  ],
  "dia-de-la-madre": [
    { particles: [{ paper: "#f5a8c6" }, { paper: "#ffd1dc" }, { paper: "#e4577a" }], motion: "fall", count: 16, size: [7, 11], duration: [12, 20], opacity: 0.7 },
    { particles: [{ decor: "heart" }], motion: "rise", count: 5, size: [12, 18], duration: [16, 24], opacity: 0.5 },
  ],
};

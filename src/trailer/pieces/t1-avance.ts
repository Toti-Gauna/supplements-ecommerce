import { beatSec } from "../core/timeline";
import type { TrailerSpec } from "../core/types";
import { t1 } from "./t1";

/**
 * Avance de T1 mientras se construye (T1.3): las escenas que ya tienen receta, con el sonido de la pieza. Sirve para ver y
 * exportar el tramo en `/trailer/t1-avance/`; se saca cuando `t1` se publique entera.
 */
export const t1Avance: TrailerSpec = { ...t1, id: "t1-avance", title: "T1 · avance (el problema)", duration: 30 * beatSec(t1.bpm), scenes: t1.scenes.slice(0, 6) };

import type { ComponentType } from "react";

/** Colores de la fecha para el escenario (pared, luz y acento). Solo la escena de apertura los usa, nunca la revelación. */
export interface StageColors {
  from: string;
  to: string;
  accent: string;
}

/**
 * Contrato de cada escena de apertura (una por fecha, en `dates/`). Dibuja adentro del `<svg>` común de 800 × 1000
 * (piso en y = 760) y solo dibuja: el escenario maneja los toques, la cámara, el sonido y la accesibilidad.
 */
export interface OpeningArtProps {
  /** Prefijo de los degradés comunes del escenario (`${u}-cyl`, `-v`, `-shadow`, `-blur`, `-soft`). */
  u: string;
  /** Avance suavizado de 0 a `steps` (con "reducir movimiento", salta). Para la geometría que se mueve. */
  t: number;
  /** Gestos hechos (entero). Para lo que cambia de golpe (y como `key` de los "kicks"). */
  step: number;
  steps: number;
  /** El regalo ya salió: la escena queda en su estado final. */
  opened: boolean;
  /** Último gesto en cámara lenta, antes de abrir. */
  slowmo: boolean;
  reduce: boolean;
  c: StageColors;
}

export type OpeningArt = ComponentType<OpeningArtProps>;

/** Piso del escenario. */
export const FLOOR = 760;

export const lerp = (a: number, b: number, k: number) => a + (b - a) * Math.min(1, Math.max(0, k));

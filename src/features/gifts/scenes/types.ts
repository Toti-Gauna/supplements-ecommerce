import type { GiftOccasion } from "@/demo/types";

/** Golpes para abrir un regalo. */
export const GIFT_HITS = 5;

/** Una escena por temática, más la de Volta (sin temática). */
export type GiftSceneId = GiftOccasion;

/**
 * Contrato de una escena de apertura (pedido de Ignacio, fuera de la especificación). La escena solo dibuja: el
 * escenario (`GiftOpener`) maneja los toques, el sonido, la vibración, el sacudón de cada golpe y la accesibilidad.
 */
export interface GiftSceneProps {
  /** Golpes dados, de 0 a `total`. Cada golpe tiene que dejar una huella visible (grieta, pétalo, cinta…). */
  hits: number;
  total: number;
  /** Se dio el último golpe: la escena hace su apertura una sola vez (≤ 1,4 s) y queda abierta. */
  opened: boolean;
  /** "Reducir movimiento": sin partículas ni recorridos; los cambios de estado pueden ser fundidos cortos. */
  reduce: boolean;
}

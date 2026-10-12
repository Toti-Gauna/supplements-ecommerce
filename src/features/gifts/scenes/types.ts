import type { GiftOccasion } from "@/demo/types";

/** Golpes para abrir un regalo. */
export const GIFT_HITS = 5;

/**
 * Contrato de la escena de apertura. La escena solo dibuja: el escenario (`GiftOpener`) maneja los toques, el sonido,
 * la vibración, el sacudón de cada golpe y la accesibilidad.
 */
export interface GiftSceneProps {
  /** Ocasión del regalo: viste la bolsa (colores de la temática y un detalle propio de la fecha). */
  occasion: GiftOccasion;
  /** Golpes dados, de 0 a `total`. Cada golpe deja una huella visible (balanceo, tiza, una costura que se abre). */
  hits: number;
  total: number;
  /** Se dio el último golpe: la bolsa se abre una sola vez (≤ 1,4 s), sale el pote y queda abierta. */
  opened: boolean;
  /** "Reducir movimiento": sin partículas ni recorridos; los cambios de estado son fundidos cortos. */
  reduce: boolean;
}

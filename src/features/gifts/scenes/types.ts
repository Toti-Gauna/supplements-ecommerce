import type { OpeningKind } from "@/demo/engine/gift-opening";
import type { GiftOccasion } from "@/demo/types";

/** Golpes para abrir un regalo con la bolsa de boxeo original (cada fecha tiene los suyos: `OPENINGS[scene].steps`). */
export const GIFT_HITS = 5;

/**
 * Contrato de la escena de apertura vista desde afuera (`GiftScene`: vista previa y Mis regalos). La escena solo
 * dibuja: la apertura interactiva (`GiftOpening`) maneja los toques, el sonido, la vibración, la cámara y la
 * accesibilidad.
 */
export interface GiftSceneProps {
  /** Ocasión del regalo: elige la apertura de su fecha (sin fecha, la bolsa de boxeo). */
  occasion: GiftOccasion;
  /** Gestos hechos, de 0 a `total`. */
  hits: number;
  total: number;
  /** Ya se abrió: la escena queda en su estado final. */
  opened: boolean;
  /** "Reducir movimiento": sin partículas ni recorridos; los cambios de estado son fundidos cortos. */
  reduce: boolean;
  /** R3b: mecánica elegida por quien regala ("bolsa" = la apertura física de la fecha, o "locker"). */
  opening?: OpeningKind;
}

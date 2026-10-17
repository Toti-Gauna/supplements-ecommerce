"use client";
import type { OpeningKind } from "@/demo/engine/gift-opening";
import type { Gift } from "@/demo/engine/gifts";
import type { GiftOccasion } from "@/demo/types";
import { GiftOpening } from "./scenes/GiftOpening";

interface Props {
  /** Ocasión del regalo: elige la apertura de su fecha (sin fecha, la bolsa de boxeo). */
  occasion: GiftOccasion;
  /** Color del destello de cada golpe (acento de la temática). */
  accent: string;
  /** Se llama cuando terminó la apertura (para mostrar qué había adentro). */
  onOpened: () => void;
  /** Lleva el foco al control al montarse (al abrirlo otra vez; la primera vez el foco queda en el escenario). */
  autoFocus?: boolean;
  /** R3b: el regalo (mecánica elegida, combinación del locker y fecha). Sin esto, la apertura física de la fecha. */
  gift?: Pick<Gift, "from" | "createdAt" | "lockerCode" | "opening">;
  /** R3b: fuerza la mecánica (vista previa). */
  opening?: OpeningKind;
}

/**
 * Apertura del regalo (se mantiene el nombre y las props de siempre). Desde R3b delega en `GiftOpening`: la apertura
 * única de la fecha (o la bolsa de boxeo rehecha) o el locker con combinación, con cámara, sonido y vibración.
 */
export function GiftOpener({ occasion, accent, onOpened, autoFocus, gift, opening }: Props) {
  return <GiftOpening occasion={occasion} accent={accent} gift={gift} opening={opening} onOpened={onOpened} autoFocus={autoFocus} />;
}

"use client";
import type { Gift } from "@/demo/engine/gifts";
import { GiftOpener } from "../GiftOpener";

interface Props {
  gift: Gift;
  /** Color del destello de cada golpe (acento de la ocasión). */
  accent: string;
  onOpened: () => void;
  autoFocus?: boolean;
}

/**
 * Punto único donde el flujo de quien recibe (R3b, parte A) entra a la apertura (parte B: bolsa rehecha, locker con
 * combinación y apertura por fecha). Pasa todo el regalo: `gift.opening` ("bolsa" | "locker"), `gift.lockerCode`
 * (4 dígitos; por defecto el día y mes del regalo) y `gift.occasion`. Hoy abre siempre con la bolsa (`GiftOpener`);
 * el locker se enchufa acá eligiendo por `gift.opening`, sin tocar /regalo/.
 */
export function GiftOpening({ gift, accent, onOpened, autoFocus }: Props) {
  return <GiftOpener occasion={gift.occasion} accent={accent} onOpened={onOpened} autoFocus={autoFocus} />;
}

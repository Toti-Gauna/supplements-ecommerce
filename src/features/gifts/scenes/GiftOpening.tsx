"use client";
import { useReducedMotion } from "motion/react";
import { demoNow } from "@/demo/clock";
import { selectOpening, type OpeningKind } from "@/demo/engine/gift-opening";
import type { Gift } from "@/demo/engine/gifts";
import type { GiftOccasion } from "@/demo/types";
import { occasionColors } from "../occasion";
import { ActionOpening } from "./ActionOpening";
import { LockerOpening } from "./LockerOpening";

export interface GiftOpeningProps {
  /** Ocasión del regalo: elige la apertura de su fecha (sin fecha, la bolsa de boxeo). */
  occasion: GiftOccasion;
  /** Lo del regalo que cambia la apertura: la mecánica que eligió quien regala, la combinación y su fecha. */
  gift?: Pick<Gift, "from" | "createdAt" | "lockerCode" | "opening">;
  /** Fuerza la mecánica (vista previa de quien regala). Si no, la del regalo; si no hay, la física. */
  opening?: OpeningKind;
  /** Acento de la luz (por defecto, el de la temática). */
  accent?: string;
  /** Terminó la apertura: ahora va la revelación. */
  onOpened: () => void;
  /** Lleva el foco al control al montarse (al abrirlo otra vez). */
  autoFocus?: boolean;
}

/**
 * Punto de entrada de la apertura del regalo (R3b). Elige con `selectOpening` (motor, con tests): el locker si quien
 * regala lo eligió, o la apertura física única de la fecha (Día del Amigo: el spot del compañero; Navidad: el árbol
 * de discos…). Con "reducir movimiento", todas quedan quietas y ofrecen abrirse de una vez.
 */
export function GiftOpening({ occasion, gift, opening, accent, onOpened, autoFocus }: GiftOpeningProps) {
  const reduce = useReducedMotion() === true;
  const pick = selectOpening({ occasion, opening: opening ?? gift?.opening });
  const o = occasionColors(occasion);
  const c = { from: o.from, to: o.to, accent: accent ?? o.accent };
  if (pick.kind === "locker") {
    const info = gift ?? { from: "quien te lo regaló", createdAt: demoNow() };
    return <LockerOpening gift={info} occasion={occasion} c={c} reduce={reduce} onOpened={onOpened} autoFocus={autoFocus} />;
  }
  return <ActionOpening scene={pick.scene} meta={pick.meta} occasion={occasion} c={c} reduce={reduce} onOpened={onOpened} autoFocus={autoFocus} />;
}

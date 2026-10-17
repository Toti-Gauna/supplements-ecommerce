"use client";
import { Palette } from "lucide-react";
import type { Gift } from "@/demo/engine/gifts";
import { GiftCardInside } from "./GiftCardInside";

interface Props {
  gift: Gift;
  /** Lo que ya eligió quien recibe ("Chocolate · 2 lb"). */
  chosen?: string;
  /** "sabor", "tamaño" o "sabor y tamaño". */
  noun: string;
  canChange: boolean;
  onChoose: () => void;
}

/**
 * Lo que va en el lugar de la tarjeta de atleta antes de "Guardá tu regalo" (R3b): si quedó sabor o tamaño abierto,
 * "Elegí tu sabor" (o lo elegido, con "Cambiar"); si es una gift card, su saldo, el código y hasta cuándo vale.
 */
export function RevealExtras({ gift, chosen, noun, canChange, onChoose }: Props) {
  if (gift.giftCard) return <GiftCardInside gift={gift} />;
  if (!gift.openChoice?.flavor && !gift.openChoice?.size) return null;
  if (chosen) {
    return (
      <p className="flex flex-wrap items-center gap-2 rounded-sm bg-white/5 px-4 py-3 text-sm ring-1 ring-white/15">
        <Palette size={16} aria-hidden="true" className="shrink-0 text-volt-soft" />
        <span className="min-w-0">Elegiste <strong>{chosen}</strong></span>
        {canChange && <button type="button" onClick={onChoose} className="ml-auto min-h-10 font-bold text-volt-soft underline underline-offset-4">Cambiar</button>}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2 rounded-sm border border-dashed border-volt-soft/60 p-4">
      <p className="text-sm text-night-muted">{gift.from} dejó el {noun} para que lo elijas vos. Ya está pago.</p>
      <button type="button" onClick={onChoose} className="flex min-h-12 items-center justify-center gap-2 rounded-sm bg-white/10 px-4 font-bold text-on-night ring-1 ring-volt-soft/60 hover:bg-white/20">
        <Palette size={17} aria-hidden="true" className="text-volt-soft" /> Elegí tu {noun}
      </button>
    </div>
  );
}

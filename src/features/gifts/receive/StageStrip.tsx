"use client";
import { CreditCard, Palette } from "lucide-react";
import type { Gift } from "@/demo/engine/gifts";

interface Props {
  gift: Gift;
  /** Lo que ya eligió quien recibe ("Chocolate · 2 lb"). */
  chosen?: string;
  /** "sabor", "tamaño" o "sabor y tamaño". */
  noun: string;
  canChange: boolean;
  onChoose: () => void;
  onCard: () => void;
}

/**
 * Cinta arriba a la izquierda del escenario, junto a la revelación (R3b): "Elegí tu sabor" si quedó abierto (o lo
 * elegido, con "Cambiar"), y "Ver mi gift card" si el regalo es una gift card. No tapa el botón de salir.
 */
export function StageStrip({ gift, chosen, noun, canChange, onChoose, onCard }: Props) {
  const open = Boolean(gift.openChoice?.flavor || gift.openChoice?.size);
  if (!open && !gift.giftCard) return null;
  const pill = "flex min-h-11 max-w-[calc(100vw-9rem)] items-center gap-2 rounded-sm px-4 text-sm font-bold ring-1 transition";
  return (
    <div className="absolute left-[max(1rem,env(safe-area-inset-left))] top-[max(1rem,env(safe-area-inset-top))] z-20 flex flex-col items-start gap-2">
      {open && (chosen ? (
        <p className={`${pill} bg-white/10 ring-white/15`}>
          <Palette size={16} aria-hidden="true" className="shrink-0 text-volt-soft" />
          <span className="min-w-0 truncate">Elegiste {chosen}</span>
          {canChange && <button type="button" onClick={onChoose} className="ml-1 shrink-0 text-volt-soft underline underline-offset-4">Cambiar</button>}
        </p>
      ) : (
        <button type="button" onClick={onChoose} className={`${pill} bg-volt-soft text-night ring-volt-soft hover:brightness-105`}>
          <Palette size={16} aria-hidden="true" className="shrink-0" /> Elegí tu {noun}
        </button>
      ))}
      {gift.giftCard && (
        <button type="button" onClick={onCard} className={`${pill} bg-volt-soft text-night ring-volt-soft hover:brightness-105`}>
          <CreditCard size={16} aria-hidden="true" className="shrink-0" /> Ver mi gift card
        </button>
      )}
    </div>
  );
}

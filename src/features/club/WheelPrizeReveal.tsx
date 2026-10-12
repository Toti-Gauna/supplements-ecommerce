"use client";
import { BookmarkPlus, Check, ShoppingBag } from "lucide-react";
import type { Ref } from "react";
import { PRIZE_STATUS_LABEL, type WheelPrize, type WheelPrizeStatus } from "@/demo/engine/wheel-prize";
import type { Coupon, GiftOccasion } from "@/demo/types";
import { ThemedCoupon } from "./ThemedCoupon";
import { WheelBurst } from "./WheelBurst";
import { ChalkDust } from "./WheelStageDecor";

interface Props {
  shown: WheelPrize;
  coupon: Coupon | undefined;
  status: WheelPrizeStatus | null;
  occasion: GiftOccasion;
  justWon: boolean;
  checkout: boolean;
  applyRef: Ref<HTMLButtonElement>;
  onApply: () => void;
  onKeep: () => void;
  onNext: () => void;
  onClose: () => void;
}

const PRIMARY = "flex min-h-14 items-center justify-center gap-2 rounded-full bg-volt-soft px-6 text-base font-bold text-night shadow-[0_12px_36px_-12px_color-mix(in_srgb,var(--brand-volt)_60%,transparent)] hover:brightness-105";

/** El premio ya sorteado: cupón de la fecha y las acciones según su estado (aplicar, guardar, seguir o salir). */
export function WheelPrizeReveal({ shown, coupon, status, occasion, justWon, checkout, applyRef, onApply, onKeep, onNext, onClose }: Props) {
  const used = status === "utilizado", applied = status === "aplicado";
  return (
    <div className="wheel-win relative flex w-full max-w-md flex-col items-center text-center">
      <ChalkDust />
      {justWon && <WheelBurst />}
      <p className="eyebrow text-volt-soft">{justWon ? "¡Ganaste!" : "Tu premio"}</p>
      <h2 className="font-display mb-6 mt-2 text-[clamp(1.9rem,8vw,2.6rem)] leading-tight">{shown.label}</h2>
      <ThemedCoupon coupon={coupon} label={shown.label} occasion={occasion} />
      {!justWon && status && <p className="mt-4 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-on-night">{PRIZE_STATUS_LABEL[status]}</p>}
      <div className="mt-7 grid w-full gap-2">
        {used ? null : applied ? (
          <button ref={applyRef} type="button" onClick={onNext} className={PRIMARY}>
            <Check size={18} aria-hidden="true" /> {checkout ? "Seguir al pago" : "Listo, ya está aplicado"}
          </button>
        ) : (
          <button ref={applyRef} type="button" onClick={onApply} className={PRIMARY}>
            <ShoppingBag size={18} aria-hidden="true" /> Aplicar ahora
          </button>
        )}
        {!used && status !== "guardado" && (
          <button type="button" onClick={onKeep} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-white/10 px-6 font-bold text-on-night ring-1 ring-white/15 hover:bg-white/20">
            <BookmarkPlus size={18} aria-hidden="true" /> Guardar para después
          </button>
        )}
        <button type="button" onClick={onClose} className="min-h-11 rounded-full px-6 text-sm font-semibold text-night-muted hover:text-white">Salir</button>
      </div>
    </div>
  );
}

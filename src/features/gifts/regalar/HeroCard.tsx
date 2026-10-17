"use client";
import { LedPrice } from "@/components/atoms/Led";
import { GIFT_CARD_RULES } from "@/demo/engine/gift-cards";
import { sampleGifts } from "@/demo/fixtures/gifts";
import { GiftCardCanvas } from "../card/GiftCardCanvas";
import { giftWhere } from "../card/share";

const SAMPLE = sampleGifts[0];

/**
 * Lo que se lleva quien recibe, al costado del titular de /regalar/ (R3b): la tarjeta de WhatsApp de muestra apenas
 * inclinada y, encima, una gift card con el monto en el marcador. Solo en escritorio; es decorativa.
 */
export function HeroCard() {
  if (!SAMPLE) return null;
  return (
    <div aria-hidden="true" className="relative hidden h-full min-h-80 lg:block">
      <div className="absolute right-4 top-1/2 w-56 -translate-y-1/2 rotate-[5deg]">
        <GiftCardCanvas data={{ to: SAMPLE.to, from: SAMPLE.from, message: SAMPLE.message, occasion: "volta", design: "box", opening: "bolsa", code: SAMPLE.code, where: giftWhere() }} className="ring-white/15" />
      </div>
      <div className="led-dark absolute -left-6 bottom-2 w-48 -rotate-[6deg] overflow-hidden rounded-md bg-[linear-gradient(135deg,var(--color-night-2),var(--color-night))] p-4 shadow-[var(--shadow-lift)] ring-1 ring-white/20">
        <span className="absolute -right-6 top-0 h-5 w-24 -skew-x-[30deg] bg-volt" />
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-night-muted">Gift card</p>
        <div className="mt-2"><LedPrice amount={GIFT_CARD_RULES.presets[1]} motion="none" className="h-7" signClassName="text-volt text-lg" /></div>
      </div>
    </div>
  );
}

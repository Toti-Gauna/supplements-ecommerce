"use client";
import { EyeOff, MessageCircle } from "lucide-react";
import type { LineGift } from "@/demo/engine/cart-types";
import { defaultLockerCode } from "@/demo/engine/gift-options";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { seasonalThemes } from "@/demo/fixtures/themes";
import { GiftCardCanvas } from "../card/GiftCardCanvas";
import { giftWhere } from "../card/share";
import { GiftScene, openingName } from "../scenes";
import { GIFT_HITS } from "../scenes/types";

/**
 * Vista previa grande de "Regalá energía" (R3b): la misma tarjeta que se manda por WhatsApp, en vivo, sobre una placa
 * noche. Debajo, cómo se abre y lo que nunca ve quien recibe (el precio).
 */
export function BuilderPreview({ draft, what }: { draft: LineGift; what: string }) {
  const occasionName = draft.occasion === "volta" ? undefined : seasonalThemes.find((t) => t.id === draft.occasion)?.name;
  const locker = draft.opening === "locker";
  return (
    <div className="floor flex flex-col gap-4 rounded-sm p-4 text-on-night ring-1 ring-white/10 sm:p-5">
      <p className="eyebrow flex items-center gap-2 text-volt"><MessageCircle size={14} aria-hidden="true" /> Así le llega por WhatsApp</p>
      <GiftCardCanvas className="mx-auto max-w-[17rem] ring-white/15 lg:max-w-[26rem]"
        data={{
          to: draft.to, from: draft.from, message: draft.message, occasion: draft.occasion, ...(occasionName ? { occasionName } : {}),
          design: draft.cardDesign, opening: locker ? "locker" : "bolsa", where: giftWhere(),
          lockerHint: locker && draft.lockerCode && draft.lockerCode !== defaultLockerCode(DEMO_TODAY) ? "propia" : "fecha",
        }} />
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-sm bg-white/5 p-3 ring-1 ring-white/10">
          <dt className="eyebrow text-night-muted">Adentro</dt>
          <dd className="mt-1 font-bold leading-snug">{what}</dd>
        </div>
        <div className="rounded-sm bg-white/5 p-3 ring-1 ring-white/10">
          <dt className="eyebrow text-night-muted">Se abre</dt>
          <dd className="mt-1 flex items-center gap-2 font-bold leading-snug">
            <span aria-hidden="true" className="block h-12 w-10 shrink-0"><GiftScene occasion={draft.occasion} opening={draft.opening} hits={0} total={GIFT_HITS} opened={false} reduce /></span>
            <span>{openingName(draft.occasion, draft.opening)}</span>
          </dd>
        </div>
      </dl>
      <p className="flex items-center gap-2 text-xs text-night-muted"><EyeOff size={14} aria-hidden="true" /> Nunca ve el precio. Le llega la tarjeta con el link y el código.</p>
    </div>
  );
}

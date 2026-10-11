"use client";
import { EyeOff } from "lucide-react";
import type { CSSProperties } from "react";
import type { LineGift } from "@/demo/engine/cart-types";
import { occasionColors } from "./occasion";
import { GIFT_SCENES, GIFT_SCENE_NAMES } from "./scenes";

/**
 * Vista previa del regalo mientras se completa (8.2.16): la escena cerrada de la ocasión, para quién, el mensaje y
 * de parte de quién, con los colores de la fecha. Como lo verá quien lo recibe: sin precio.
 */
export function GiftPreview({ draft, productName }: { draft: LineGift; productName: string }) {
  const c = occasionColors(draft.occasion);
  const Scene = GIFT_SCENES[draft.occasion];
  const message = draft.message.trim();
  return (
    <div style={{ "--g-from": c.from, "--g-to": c.to, "--g-accent": c.accent } as CSSProperties}
      className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-[linear-gradient(150deg,var(--g-from),var(--g-to))] p-5 text-[#f6f1e8] sm:p-6">
      <p className="eyebrow text-[color:var(--g-accent)]">Vista previa · así lo recibe</p>
      <div aria-hidden="true" className="mx-auto my-3 aspect-square w-[min(55%,11rem)]">
        <Scene key={draft.occasion} hits={0} total={5} opened={false} reduce />
      </div>
      <p className="text-center text-xs font-bold uppercase tracking-wider opacity-80">{GIFT_SCENE_NAMES[draft.occasion]}</p>
      <div className="mt-4 rounded-2xl bg-black/20 p-4 backdrop-blur-[2px]">
        <p className="font-display text-2xl leading-tight">Para {draft.to.trim() || "…"}</p>
        <p className={`mt-2 whitespace-pre-line break-words text-sm ${message ? "" : "italic opacity-70"}`}>{message ? `“${message}”` : "Tu mensaje aparece acá."}</p>
        <p className="mt-3 text-sm font-bold">De {draft.from.trim() || "…"}</p>
        <p className="mt-1 text-xs opacity-80">{productName}</p>
      </div>
      <p className="mt-auto flex items-center gap-2 pt-4 text-xs opacity-85"><EyeOff size={14} aria-hidden="true" /> Nunca ve el precio. Recibe un link y un código para abrirlo.</p>
    </div>
  );
}

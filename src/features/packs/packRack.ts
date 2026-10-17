import type { RackItem } from "@/components/illustrations/RackShot";
import type { PackQuote } from "@/demo/engine/packs";

/** Hasta tres envases del pack para el estante de la tarjeta: los suplementos primero, el equipamiento después. */
export function packRack(quote: PackQuote): RackItem[] {
  const ordered = [...quote.lines.filter((l) => l.recurring), ...quote.lines.filter((l) => !l.recurring)];
  return ordered.slice(0, 3).map((l) => ({ art: l.product.art, pack: l.product.pack, tint: l.variant.colorHex }));
}

/** Texto de "te dura": lo que se repite cada mes alcanza para tantos días (a un servicio por día). */
export function lastsText(days: number | null): string | null {
  return days ? `te dura ${days} ${days === 1 ? "día" : "días"}` : null;
}

export const packHref = (id: string) => `/packs/?pack=${encodeURIComponent(id)}`;

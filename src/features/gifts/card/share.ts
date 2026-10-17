"use client";
import { brand } from "@/config/brand";
import { defaultLockerCode } from "@/demo/engine/gift-options";
import type { Gift } from "@/demo/engine/gifts";
import { seasonalThemes } from "@/demo/fixtures/themes";
import { withBase } from "@/lib/base-path";
import { renderGiftCardPng, type GiftCardArtData } from "./drawGiftCard";

/** Dónde se abre, corto para imprimir en la tarjeta ("usuario.github.io/tienda/regalo"). */
export function giftWhere(): string {
  if (typeof window === "undefined") return "/regalo";
  return `${window.location.host}${withBase("/regalo")}`;
}

/** Lo que dibuja la tarjeta de un regalo ya creado (con su código). */
export function artFromGift(gift: Gift): GiftCardArtData {
  const occasionName = gift.occasion === "volta" ? undefined : seasonalThemes.find((t) => t.id === gift.occasion)?.name;
  return {
    to: gift.to, from: gift.from, message: gift.message, occasion: gift.occasion, ...(occasionName ? { occasionName } : {}),
    design: gift.cardDesign, opening: gift.opening ?? "bolsa", code: gift.code, where: giftWhere(),
    lockerHint: gift.lockerCode && gift.lockerCode !== defaultLockerCode(gift.createdAt) ? "propia" : "fecha",
  };
}

const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "regalo";

export type SendResult = "shared" | "downloaded" | "cancelled";

/**
 * Manda la tarjeta como imagen: con la hoja de compartir del celular (WhatsApp, con el texto y el link), o la descarga
 * para adjuntarla a mano. Nada sale a un servicio externo desde la página.
 */
export async function sendGiftCard(gift: Gift, url: string): Promise<SendResult> {
  const blob = await renderGiftCardPng(artFromGift(gift));
  const name = `regalo-${slug(gift.to)}-${gift.code.toLowerCase()}.png`;
  const file = new File([blob], name, { type: "image/png" });
  const how = gift.opening === "locker" ? "Se abre con combinación" : "Se abre a golpes";
  const text = `🥊 ¡${gift.to}, te llegó un regalo de ${gift.from} en ${brand.name}! ${how}: ${url} (código ${gift.code})`;
  if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file], text })) {
    try {
      await navigator.share({ files: [file], text, title: `Un regalo de ${brand.name}` });
      return "shared";
    } catch (e) {
      if ((e as Error).name === "AbortError") return "cancelled";
    }
  }
  const href = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 4000);
  return "downloaded";
}

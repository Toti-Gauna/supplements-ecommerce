import { formatARS } from "@/lib/money";
import type { ThemeOffer } from "../../engine/themes";
import { STUDIO_BRAND, STUDIO_HOOKS, STUDIO_KEYWORDS, STUDIO_STEPS, type StudioFormat, type StudioHook } from "../../fixtures/studio";
import type { SeasonalTheme } from "../../types";
import type { StudioProduct } from "./content";

/** Ganchos que aplican a los productos elegidos (los específicos primero, después los genéricos). */
export function hooksFor(products: StudioProduct[]): StudioHook[] {
  const lead = products[0];
  const fits = (h: StudioHook) => (!h.personalizable || products.some((p) => p.personalizable)) && (h.categories.length === 0 || products.some((p) => h.categories.includes(p.categorySlug)));
  const specific = STUDIO_HOOKS.filter((h) => h.categories.length > 0 && fits(h) && (!lead || h.categories.includes(lead.categorySlug)));
  const others = STUDIO_HOOKS.filter((h) => fits(h) && !specific.includes(h));
  return [...specific, ...others];
}

export function keywordFor(products: StudioProduct[]): string {
  return STUDIO_KEYWORDS[products[0]?.categorySlug ?? ""] ?? "VOLTA";
}

/** Hashtag sin espacios ni signos ("Día de la Madre" → #DíaDeLaMadre). Pocos: rinden poco. */
export function hashtag(text: string): string {
  const words = text.replace(/[^\p{L}\p{N} ]/gu, "").split(" ").filter(Boolean);
  return `#${words.map((w) => w[0]!.toUpperCase() + w.slice(1)).join("")}`;
}

export function themeHashtag(theme: SeasonalTheme | null): string | null {
  return theme ? hashtag(theme.name) : null;
}

export function offerLine(offer: ThemeOffer | null): string | null {
  if (!offer) return null;
  return `${offer.label} con el código ${offer.coupon.code}${offer.condition ? ` (${offer.condition.toLowerCase()})` : ""}`;
}

export interface CaptionInput {
  theme: SeasonalTheme | null;
  offer: ThemeOffer | null;
  products: StudioProduct[];
  format: StudioFormat;
  /** Cambia de gancho con "Otra idea". */
  variant: number;
  /** Lo mismo que muestra la pieza: sin precio u oferta si se apagaron. */
  showPrice?: boolean;
  showOffer?: boolean;
}

/** Texto sugerido para el posteo: gancho, fecha, productos con precio, oferta, cierre con palabra clave y pocos hashtags. */
export function buildCaption({ theme, offer: rawOffer, products, format, variant, showPrice = true, showOffer = true }: CaptionInput): { hook: StudioHook; text: string } {
  const offer = showOffer ? rawOffer : null;
  const hooks = hooksFor(products);
  const hook = hooks[((variant % hooks.length) + hooks.length) % hooks.length]!;
  const keyword = keywordFor(products);
  const lines: string[] = [hook.hook, ""];
  if (theme) lines.push(`Especial ${theme.name}: ${theme.subtitle}`);
  else lines.push(`${STUDIO_BRAND.title}, hechos a mano en ${STUDIO_BRAND.city}.`);
  if (products.length) {
    lines.push("");
    for (const p of products) lines.push(showPrice ? `• ${p.name}: ${formatARS(p.price)}${offer && p.offerPrice !== null ? ` (con el cupón, ${formatARS(p.offerPrice)})` : ""}` : `• ${p.name}`);
  }
  const deal = offerLine(offer);
  if (deal) lines.push("", deal);
  if (format === "carousel") lines.push("", `Cómo pedir el tuyo: ${STUDIO_STEPS.map((s, i) => `${i + 1}) ${s.toLowerCase()}`).join(" · ")}.`);
  lines.push("", hook.closer.replace("{KEYWORD}", keyword), STUDIO_BRAND.closing);
  lines.push("", [hashtag(STUDIO_BRAND.city), hashtag(STUDIO_BRAND.handMade), themeHashtag(theme)].filter(Boolean).join(" "));
  return { hook, text: lines.join("\n") };
}

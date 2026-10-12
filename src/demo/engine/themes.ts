import { formatARS } from "@/lib/money";
import type { Coupon, Product, SeasonalTheme, SeasonId } from "../types";
import { demoData } from "./source";

/** "MM-DD" de una fecha AAAA-MM-DD o de un Date (hora local). */
function monthDay(value: string | Date): string {
  if (typeof value === "string") return value.slice(5, 10);
  return `${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

/** ¿La fecha cae dentro de la temática? Solo cuentan mes y día; contempla rangos que cruzan el año. */
export function inSeason(theme: Pick<SeasonalTheme, "startsOn" | "endsOn">, now: Date): boolean {
  const day = monthDay(now), from = monthDay(theme.startsOn), to = monthDay(theme.endsOn);
  return from <= to ? day >= from && day <= to : day >= from || day <= to;
}

/** Temática que corresponde por fecha (la primera habilitada que coincide). */
export function themeForDate(themes: SeasonalTheme[], now: Date): SeasonalTheme | null {
  return themes.find((t) => t.active && inSeason(t, now)) ?? null;
}

/**
 * Temática visible en la tienda. La vista previa ("Probar temáticas", u "original" para verla sin temática) manda; si no, el modo del panel:
 * automática por fecha, fija o ninguna.
 */
export function currentTheme(now: Date, previewId: SeasonId | "original" | null): SeasonalTheme | null {
  const { themes, themeSettings } = demoData();
  if (previewId === "original") return null;
  // Una vista previa que ya no existe (p. ej. "san-patricio" guardada antes de la Fase 5) no tapa la temática del panel.
  const previewed = previewId ? themes.find((t) => t.id === previewId) : undefined;
  if (previewed) return previewed;
  if (themeSettings.mode === "off") return null;
  if (themeSettings.mode === "fixed") return themes.find((t) => t.id === themeSettings.fixedId) ?? null;
  return themeForDate(themes, now);
}

/** Próxima temática habilitada después de hoy (para mostrar "lo que viene" en el panel). */
export function nextTheme(now: Date): SeasonalTheme | null {
  const day = monthDay(now);
  const list = demoData().themes.filter((t) => t.active);
  const ahead = [...list].sort((a, b) => monthDay(a.startsOn).localeCompare(monthDay(b.startsOn)));
  return ahead.find((t) => monthDay(t.startsOn) > day) ?? ahead[0] ?? null;
}

export interface ThemeOffer {
  coupon: Coupon;
  /** "20% OFF", "$3.000 OFF" o "Envío gratis". */
  label: string;
  /** Condición visible ("Desde $30.000"), si la hay. */
  condition: string | null;
}

/** Oferta de la temática: su cupón vigente (si está pausado o no existe, no hay oferta). */
export function themeOffer(theme: SeasonalTheme): ThemeOffer | null {
  const coupon = demoData().coupons.find((c) => c.code === theme.couponCode);
  if (!coupon || coupon.active === false) return null;
  const label = coupon.type === "PERCENT" ? `${coupon.value}% OFF` : coupon.type === "FIXED" ? `$${coupon.value.toLocaleString("es-AR")} OFF` : "Envío gratis";
  const condition = coupon.minSubtotal ? `Desde $${coupon.minSubtotal.toLocaleString("es-AR")} de compra` : null;
  return { coupon, label, condition };
}

/** Precio con el cupón de la temática, solo para descuentos por porcentaje sin mínimo (si no, null). */
export function offerPrice(price: number, offer: ThemeOffer | null): number | null {
  if (!offer || offer.coupon.type !== "PERCENT" || offer.coupon.minSubtotal) return null;
  return Math.round(price * (1 - offer.coupon.value / 100));
}

/**
 * Insignia y precio de una tarjeta del riel de ofertas. Si el cupón pide un mínimo de compra, el precio de la tarjeta
 * va sin descuento, así que la insignia lleva la condición ("−30 % desde $ 40.000") en vez de un "30% OFF" que con ese
 * precio no se cumple.
 */
export function cardDeal(price: number, offer: ThemeOffer): { price: number | null; label: string } {
  const { type, value, minSubtotal } = offer.coupon;
  if (!minSubtotal) return { price: offerPrice(price, offer), label: offer.label };
  const off = type === "PERCENT" ? `−${value}\u00a0%` : type === "FIXED" ? `−${formatARS(value)}` : "Envío gratis";
  return { price: null, label: `${off} desde ${formatARS(minSubtotal)}` };
}

/** Productos en oferta de la temática, en el orden elegido; omite pausados o borrados. */
export function themeProducts(theme: SeasonalTheme): Product[] {
  const products = demoData().products;
  return theme.productSlugs.flatMap((slug) => products.filter((p) => p.slug === slug && p.active !== false));
}

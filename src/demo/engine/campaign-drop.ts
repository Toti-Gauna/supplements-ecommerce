import { formatARS } from "@/lib/money";
import type { Coupon, SeasonalTheme } from "../types";

/**
 * El "Drop" de una campaña (R3a): el descuento como número de marcador y el cupón como ticket de acceso. Sale del
 * cupón de la temática (lo que se cobra lo valida igual el engine de cupones al pagar). Puro y testeado.
 */
export interface DropDiscount {
  kind: "percent" | "fixed" | "shipping";
  /** Lo que dibuja el marcador LED ("30", "5.000") o null si no es un número. */
  led: string | null;
  /** Lo que acompaña al número: "%" después o "$" antes. */
  sign: "%" | "$" | null;
  /** Lectura completa: "30 %", "$ 5.000" o "Envío gratis". */
  label: string;
  /** Condición del ticket ("Desde $ 40.000 de compra") o null. */
  condition: string | null;
}

export function dropDiscount(coupon: Pick<Coupon, "type" | "value" | "minSubtotal">): DropDiscount {
  const condition = coupon.minSubtotal ? `Desde ${formatARS(coupon.minSubtotal)} de compra` : null;
  if (coupon.type === "PERCENT") return { kind: "percent", led: String(coupon.value), sign: "%", label: `${coupon.value} %`, condition };
  if (coupon.type === "FIXED") {
    const amount = formatARS(coupon.value);
    return { kind: "fixed", led: amount.replace(/[^\d.]/g, ""), sign: "$", label: amount, condition };
  }
  return { kind: "shipping", led: null, sign: null, label: "Envío gratis", condition };
}

/** Lo que falta en el carrito para que el cupón de la campaña aplique (0 si ya aplica o no pide mínimo). */
export function missingForDrop(subtotal: number, coupon: Pick<Coupon, "minSubtotal">): number {
  return Math.max(0, (coupon.minSubtotal ?? 0) - subtotal);
}

/**
 * Número de serie del ticket ("BF·2311·0730"): iniciales de la campaña, día y mes de inicio y cuatro dígitos que
 * salen del código. Decorativo y siempre el mismo para la misma campaña (no es un código que se pueda usar).
 */
export function ticketSerial(theme: Pick<SeasonalTheme, "name" | "startsOn" | "couponCode">): string {
  const initials = theme.name.split(/\s+/).filter((w) => /^[A-ZÁÉÍÓÚ0-9]/i.test(w) && w.length > 2).map((w) => w[0]!.toUpperCase()).join("").slice(0, 3) || "VX";
  const hash = [...theme.couponCode].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 10_000, 7);
  return `${initials}·${theme.startsOn.slice(8, 10)}${theme.startsOn.slice(5, 7)}·${String(hash).padStart(4, "0")}`;
}

/** Barras del código decorativo del ticket (anchos 1–3): siempre las mismas para el mismo código. */
export function ticketBars(code: string, count = 28): number[] {
  let seed = [...code].reduce((h, c) => (h * 33 + c.charCodeAt(0)) >>> 0, 5381);
  return Array.from({ length: count }, () => {
    seed = (seed * 1_103_515_245 + 12_345) >>> 0;
    return 1 + ((seed >>> 16) % 3);
  });
}

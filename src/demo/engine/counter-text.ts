import type { CounterPot } from "./counter";
import { formatExpiry } from "./lots";
import { formatARS } from "@/lib/money";

/**
 * "Consulta rápida" del mostrador (R4b): precio y stock de un producto en un texto listo para pegar en WhatsApp. No
 * promete beneficios ni dosis: solo precio, disponibilidad y cómo se entrega. Puro y testeado.
 */

/** Cómo se dice el stock al cliente: sin números exactos salvo cuando quedan pocas. */
export function stockWord(pot: Pick<CounterPot, "state" | "left">): string {
  switch (pot.state) {
    case "ok": return "hay stock";
    case "low": return pot.left === 1 ? "queda 1" : `quedan ${pot.left}`;
    case "out": return "sin stock por ahora";
    case "on-order": return "a pedido";
  }
}

/** Una línea por pote: "• Chocolate · 2 lb: $54.900 · hay stock". La liquidación avisa el vencimiento del lote. */
export function potLine(pot: CounterPot): string {
  const price = pot.clearancePct && pot.nextLot
    ? `${formatARS(pot.price)} (liquidación, antes ${formatARS(pot.listPrice)}; vence ${formatExpiry(pot.nextLot.expires)})`
    : formatARS(pot.price);
  return `• ${pot.variantLabel}: ${price} · ${stockWord(pot)}`;
}

export interface QuickQueryContext {
  /** Nombre de la tienda (marca blanca). */
  store: string;
  city: string;
}

/** El mensaje entero para un producto. Sin potes, null. */
export function quickQueryText(pots: readonly CounterPot[], ctx: QuickQueryContext): string | null {
  const first = pots[0];
  if (!first) return null;
  const sellable = pots.some((p) => p.state !== "out");
  const close = sellable
    ? `Lo retirás en el local o te lo llevamos con cadete en ${ctx.city}. ¿Te lo separo?`
    : "Te aviso apenas vuelva a entrar.";
  return [
    `¡Hola! Te paso precio y stock de hoy de ${first.productName} (${first.brand}):`,
    ...pots.map(potLine),
    close,
    `— ${ctx.store}`,
  ].join("\n");
}

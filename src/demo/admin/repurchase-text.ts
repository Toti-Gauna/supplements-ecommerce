import { DISPATCH_PROMISE } from "../engine/lead-time";
import { categories } from "../fixtures/categories";
import { servingsPerWeek } from "../fixtures/customers";
import { formatDay } from "@/lib/date";
import type { RepurchaseItem } from "./repurchase";

/** Textos de la recompra (ficha, inicio, ayuda y WhatsApp). Puros: la UI solo los muestra. */

/** La regla de consumo en palabras (para la ayuda de segmentos): se arma con la misma tabla que usa el cálculo. */
export function consumptionRule(): string {
  const name = (slug: string) => categories.find((c) => c.slug === slug)?.name.toLowerCase() ?? slug;
  const byRate = new Map<number, string[]>();
  for (const [slug, n] of Object.entries(servingsPerWeek)) if (n !== 7) byRate.set(n, [...(byRate.get(n) ?? []), name(slug)]);
  const fewer = [...byRate].sort((a, b) => b[0] - a[0]).map(([n, list]) => `${list.join(" y ")}, ${n} por semana`);
  return `un servicio por día desde que lo recibió${fewer.length ? ` (${fewer.join("; ")})` : ""}`;
}

export function whenText(inDays: number): string {
  if (inDays === 0) return "hoy";
  if (inDays === 1) return "mañana";
  if (inDays === -1) return "ayer";
  return inDays > 0 ? `en ${inDays} días` : `hace ${-inDays} días`;
}

/** "jueves 8 de octubre". */
export const dayText = (day: string) => formatDay(day, "long").replace(",", "");

/** "Se le termina el jueves 8 de octubre" / "Se le terminó el domingo 20 de septiembre". */
export function runOutText(item: Pick<RepurchaseItem, "runsOutOn" | "inDays">): string {
  if (item.inDays === 0) return "Se le termina hoy";
  return `${item.inDays < 0 ? "Se le terminó" : "Se le termina"} el ${dayText(item.runsOutOn)}`;
}

/** La fecha con cuánto falta: "Se le termina el jueves 8 de octubre (en 4 días)"; hoy no repite el "hoy". */
export function runOutLine(item: Pick<RepurchaseItem, "runsOutOn" | "inDays">): string {
  return item.inDays === 0 ? runOutText(item) : `${runOutText(item)} (${whenText(item.inDays)})`;
}

/** Lo mismo, hablándole al comprador ("Mi box"): "Se te termina el jueves 8 de octubre (en 4 días)". */
export function runOutLineForBuyer(item: Pick<RepurchaseItem, "runsOutOn" | "inDays">): string {
  return runOutLine(item).replace(/^Se le /, "Se te ");
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

/** Mensaje de WhatsApp prellenado para avisarle al cliente. Con `link`, suma el bolso ya armado (R4c). */
export function repurchaseMessage(item: RepurchaseItem, store: string, link?: string): string {
  const when = item.inDays < 0 ? `ya se te terminó tu ${item.product}` : `${item.inDays === 0 ? "hoy" : `el ${dayText(item.runsOutOn)}`} se te termina tu ${item.product}`;
  const cart = link ? ` Te dejé el bolso armado con lo mismo, para que confirmes cuando quieras: ${link}` : "";
  return `¡Hola ${firstName(item.name)}! Te escribimos de ${store}. Calculamos que ${when}. ¿Te preparamos otro? En Mar del Plata te lo llevamos con cadete ${DISPATCH_PROMISE}.${cart}`;
}

/** Link de WhatsApp al teléfono del cliente (celular argentino: 54 9 + característica + número). */
export function customerWhatsappLink(phone: string | undefined, text: string): string | null {
  const digits = phone?.replace(/\D/g, "") ?? "";
  if (digits.length < 8) return null;
  const number = digits.startsWith("54") ? digits : `549${digits.replace(/^0/, "")}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

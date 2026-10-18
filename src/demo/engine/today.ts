import type { AdminData } from "../admin/defaults";
import type { OrderStatus } from "./orders";

/**
 * "Hoy en tu tienda" (R4a): el marcador del día y la lista de acciones ordenada por urgencia. Todo es puro y sale de
 * los datos del panel contra el día de la demo (`DEMO_TODAY`); en producción lo calcula el servidor con la fecha real.
 *
 * Cómo se ordena la lista (siempre igual, sin puntajes ocultos):
 * 1. Por nivel: Atrasado → Para hoy → Esta semana → Más adelante (ver las reglas de cada tipo en today-*.ts).
 * 2. Dentro del nivel, por tipo, en el orden de `KIND_ORDER`: lo que tiene a un cliente esperando va primero.
 * 3. Después, lo que vence antes (`due`) y, si empatan, por `id` (estable).
 */
export type TodayTier = "atrasado" | "hoy" | "semana" | "despues";
export const TIER_ORDER: readonly TodayTier[] = ["atrasado", "hoy", "semana", "despues"];
export const TIER_LABEL: Record<TodayTier, string> = { atrasado: "Atrasado", hoy: "Para hoy", semana: "Esta semana", despues: "Más adelante" };

export type TodayKind = "late" | "receipt" | "dispatch" | "pack" | "purchase" | "repurchase" | "gift" | "birthday" | "lot" | "campaign" | "lots";
/** Prioridad dentro de un mismo nivel. */
export const KIND_ORDER: readonly TodayKind[] = ["late", "receipt", "dispatch", "pack", "purchase", "repurchase", "gift", "birthday", "lot", "campaign", "lots"];

/** El único botón de cada fila: resuelve ahí mismo (con confirmación) o lleva exactamente al lugar. */
export type TodayCta =
  | { type: "link"; label: string; href: string }
  /** Aprobar un comprobante: SIEMPRE con confirmación de que el ingreso se verificó. */
  | { type: "approve"; label: string; code: string; amount: number }
  /** Pedido listo que sale hoy: enviado (cadete o correo) o entregado (retiro). */
  | { type: "dispatch"; label: string; code: string; to: Extract<OrderStatus, "SHIPPED" | "DELIVERED"> }
  /** Abre la liquidación del lote con el descuento propuesto. */
  | { type: "clearance"; label: string; lotKey: string; pct: number }
  /** Abre la lista de clientes para avisar (email o WhatsApp). */
  | { type: "repurchase"; label: string; keys: string[] };

export interface TodayAction {
  id: string;
  kind: TodayKind;
  tier: TodayTier;
  /** Día que manda el orden dentro del nivel (AAAA-MM-DD). */
  due: string;
  title: string;
  detail: string;
  /** Cifra del marcador de la fila (cantidad, pesos o días). */
  metric: { value: number; money?: boolean; unit?: string };
  /** Dónde vive esto en el panel (el título lleva ahí). */
  href: string;
  cta: TodayCta;
  checklist?: { label: string; done: boolean; href?: string }[];
}

/** Lo que el motor lee del panel. */
export type TodaySnapshot = Pick<AdminData, "orders" | "users" | "data" | "workshop">;

const tierRank = (t: TodayTier) => TIER_ORDER.indexOf(t);
const kindRank = (k: TodayKind) => KIND_ORDER.indexOf(k);

export function compareActions(a: TodayAction, b: TodayAction): number {
  return tierRank(a.tier) - tierRank(b.tier) || kindRank(a.kind) - kindRank(b.kind) || a.due.localeCompare(b.due) || a.id.localeCompare(b.id);
}

export function rankActions(list: TodayAction[]): TodayAction[] {
  return [...list].sort(compareActions);
}

/** Las acciones agrupadas por nivel, en orden (sin niveles vacíos). */
export function groupByTier(list: TodayAction[]): { tier: TodayTier; actions: TodayAction[] }[] {
  return TIER_ORDER.map((tier) => ({ tier, actions: list.filter((a) => a.tier === tier) })).filter((g) => g.actions.length > 0);
}

/** "Buen día", "Buenas tardes" o "Buenas noches" según la hora de Buenos Aires de `now` (ISO). */
export function greetingFor(now: string): string {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: "America/Argentina/Buenos_Aires" }).format(new Date(now)));
  if (hour >= 5 && hour < 13) return "Buen día";
  return hour >= 13 && hour < 20 ? "Buenas tardes" : "Buenas noches";
}

/** La frase de arriba: cuánto hay y por dónde arrancar. */
export function summaryLine(actions: TodayAction[]): string {
  const urgent = actions.filter((a) => a.tier === "atrasado" || a.tier === "hoy").length;
  if (!actions.length) return "Todo al día: no hay nada pendiente.";
  if (!urgent) return `Nada urgente para hoy. ${actions.length === 1 ? "Queda 1 cosa" : `Quedan ${actions.length} cosas`} para la semana.`;
  return `${urgent === 1 ? "Tenés 1 cosa" : `Tenés ${urgent} cosas`} para hoy. Arrancá por la primera de la lista.`;
}

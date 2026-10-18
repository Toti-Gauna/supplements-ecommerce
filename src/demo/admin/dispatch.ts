import { getProduct } from "../engine/catalog";
import { isPaidOrLater, type OrderStatus } from "../engine/orders";
import { addDays, nextWorkday, type WorkCalendar } from "../engine/workdays";
import { CADETE_ZONES, OTHER_ZONE, type CadeteZone } from "../fixtures/cadete-zones";
import { formatDay } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { packStep } from "./order-work";
import type { AdminOrder } from "./types";
import { lotFor } from "./workshop/lots";

/**
 * Despachos del día (R4b): la lista de armado consolidada (cuántos de cada variante juntar para todos los pedidos que
 * salen ese día) y la hoja de ruta del cadete, ordenada por zona y franja. Puro y sin fecha real: todo contra `today`.
 */

/** Todavía no salió: ocupa un lugar en el día comprometido. */
const NOT_LEFT: OrderStatus[] = ["PENDING_PAYMENT", "PAYMENT_REVIEW", "PAID", "IN_PRODUCTION", "READY"];

/** ¿Sale ese día? Lo atrasado (fecha vencida y sin salir) se suma a hoy. */
export function leavesOn(o: Pick<AdminOrder, "status" | "promisedDate">, day: string, today: string): boolean {
  if (!o.promisedDate || !NOT_LEFT.includes(o.status)) return false;
  return o.promisedDate === day || (day === today && o.promisedDate < today);
}

/** "Hoy", "Mañana" o "jue 8 oct". */
export function dayLabel(day: string, today: string): string {
  if (day === today) return "Hoy";
  if (day === addDays(today, 1)) return "Mañana";
  return formatDay(day).replace(",", "");
}

export interface DispatchDay { day: string; label: string; count: number }

/** Hoy y los próximos días hábiles de despacho, con cuántos pedidos salen cada uno. */
export function dispatchDays(orders: AdminOrder[], today: string, cal: WorkCalendar, n = 5): DispatchDay[] {
  const days = [today];
  while (days.length < n) days.push(nextWorkday(days.at(-1)!, cal));
  return days.map((day) => ({ day, label: dayLabel(day, today), count: orders.filter((o) => leavesOn(o, day, today)).length }));
}

export interface PickOrder { code: string; quantity: number; /** Ya pasó el paso 1 (los potes están juntos). */ gathered: boolean }
export interface PickRow {
  key: string;
  productSlug: string;
  variantId: string;
  name: string;
  variant: string;
  quantity: number;
  /** Unidades que ya están juntas (pedidos en control de lote). */
  gathered: number;
  /** Lote que sale (el que vence primero), igual que en el control de lote. */
  lot: string;
  orders: PickOrder[];
}

/** Lista de armado consolidada de los pedidos pagados que salen ese día, por variante y en orden alfabético. */
export function pickingList(orders: AdminOrder[], day: string, today: string): PickRow[] {
  const rows = new Map<string, PickRow>();
  for (const o of orders.filter((x) => leavesOn(x, day, today) && packStep(x) !== null)) {
    const gathered = packStep(o) === 2;
    for (const l of o.lines) {
      const key = `${l.productSlug}::${l.variantId}`;
      let row = rows.get(key);
      if (!row) {
        const p = getProduct(l.productSlug);
        const v = p?.variants.find((x) => x.id === l.variantId);
        row = { key, productSlug: l.productSlug, variantId: l.variantId, name: p?.name ?? l.productSlug, variant: v?.label ?? "", quantity: 0, gathered: 0, lot: lotFor(p, v).text, orders: [] };
        rows.set(key, row);
      }
      row.quantity += l.quantity;
      if (gathered) row.gathered += l.quantity;
      row.orders.push({ code: o.code, quantity: l.quantity, gathered });
    }
  }
  return [...rows.values()].sort((a, b) => a.name.localeCompare(b.name, "es") || a.variant.localeCompare(b.variant, "es"));
}

const plain = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** Zona del cadete según la calle de la dirección ("Av. Colón 1500, …" → Centro); si no coincide, "Otras zonas". */
export function zoneFor(address: string | undefined, zones: CadeteZone[] = CADETE_ZONES): CadeteZone {
  const street = plain(address ?? "").replace(/^(av\.?|avenida)\s+/, "");
  return zones.find((z) => z.streets.some((s) => street === s || street.startsWith(`${s} `) || street.startsWith(`${s},`))) ?? OTHER_ZONE;
}

export type StopState = "ready" | "packing" | "unpaid";

export interface RouteStop {
  code: string;
  name: string;
  address: string;
  zone: CadeteZone;
  total: number;
  /** Lo que el cadete tiene que cobrar: 0 si ya está pagado. */
  toCollect: number;
  state: StopState;
  /** Tenía que salir antes. */
  late: boolean;
}

/** Hoja de ruta del cadete: los envíos en Mar del Plata de ese día, por zona (en el orden del recorrido) y dirección. */
export function cadeteRoute(orders: AdminOrder[], day: string, today: string, zones: CadeteZone[] = CADETE_ZONES): RouteStop[] {
  const rank = (z: CadeteZone) => { const i = zones.findIndex((x) => x.id === z.id); return i < 0 ? zones.length : i; };
  return orders.filter((o) => o.fulfillment === "LOCAL_DELIVERY" && leavesOn(o, day, today)).map((o): RouteStop => {
    const paid = isPaidOrLater(o.status);
    return {
      code: o.code, name: o.customer.name, address: o.address ?? "Sin dirección cargada", zone: zoneFor(o.address, zones), total: o.total,
      toCollect: paid ? 0 : o.total, state: o.status === "READY" ? "ready" : paid ? "packing" : "unpaid", late: o.promisedDate! < day,
    };
  }).sort((a, b) => rank(a.zone) - rank(b.zone) || a.address.localeCompare(b.address, "es") || a.code.localeCompare(b.code));
}

/** La hoja de ruta como texto para mandarle al cadete (por WhatsApp o impresa). */
export function routeText(stops: RouteStop[], day: string, today: string, store: string): string {
  const head = `Hoja de ruta de ${store} · ${dayLabel(day, today)}${day === today ? ` (${formatDay(day).replace(",", "")})` : ""}`;
  const lines = stops.map((s, i) => `${i + 1}. ${s.zone.name} (${s.zone.window}) · ${s.address} · ${s.name} · ${s.code} · ${s.toCollect ? `cobrar ${formatARS(s.toCollect)}` : "ya pagó"}`);
  return [head, ...(lines.length ? lines : ["Sin envíos con cadete."])].join("\n");
}

/** Lo que sale ese día sin cadete: correo y retiros en el local. */
export function otherDispatches(orders: AdminOrder[], day: string, today: string): AdminOrder[] {
  return orders.filter((o) => o.fulfillment !== "LOCAL_DELIVERY" && leavesOn(o, day, today)).sort((a, b) => a.fulfillment.localeCompare(b.fulfillment) || a.code.localeCompare(b.code));
}

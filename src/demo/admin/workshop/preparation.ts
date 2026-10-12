import type { CartLine } from "../../engine/cart-types";
import type { OrderStatus } from "../../engine/orders";

/**
 * Preparación de pedidos (Fase 7): cada pedido pagado pasa por Armando y Control de lote hasta quedar listo para
 * despachar. "Armando" y "Control de lote" son etapas internas del estado "En preparación"; "Listo para despachar" es
 * el estado Listo. Nada sale sin el lote confirmado de cada línea.
 */
export type PrepStage = "picking" | "lot-check";
export type PrepColumn = "queue" | PrepStage | "ready";

export const PREP_COLUMNS: { id: PrepColumn; label: string; hint: string }[] = [
  { id: "queue", label: "Por preparar", hint: "Pagados, esperando que los armes" },
  { id: "picking", label: "Armando", hint: "Productos, embalaje y regalo" },
  { id: "lot-check", label: "Control de lote", hint: "Confirmá el lote que sale de cada producto" },
  { id: "ready", label: "Listo para despachar", hint: "Para el cadete, el correo o el retiro" },
];

export const prepLabel = (c: PrepColumn) => PREP_COLUMNS.find((x) => x.id === c)!.label;

interface PrepOrder {
  status: OrderStatus;
  stage?: PrepStage;
  lines?: CartLine[];
  lotCheck?: Record<string, string>;
}

export function columnOf(order: PrepOrder): PrepColumn | null {
  if (order.status === "PAID") return "queue";
  if (order.status === "IN_PRODUCTION") return order.stage === "lot-check" ? "lot-check" : "picking";
  return order.status === "READY" ? "ready" : null;
}

/** Líneas que todavía no tienen el lote confirmado. */
export function missingLots(order: PrepOrder): CartLine[] {
  return (order.lines ?? []).filter((l) => !order.lotCheck?.[l.id]);
}

export type PrepMove =
  | { ok: true; status: OrderStatus; stage?: PrepStage }
  /** `lots`: solo falta confirmar los lotes (la pantalla abre el control en lugar de avisar). */
  | { ok: false; error: string; lots?: boolean };

const ORDER = PREP_COLUMNS.map((c) => c.id);

/** Qué cambia al mover una tarjeta: el estado del pedido (spec 5.2) y la etapa interna de preparación. */
export function prepMove(order: PrepOrder, to: PrepColumn): PrepMove {
  const from = columnOf(order);
  if (!from) return { ok: false, error: "Este pedido no está en preparación." };
  if (from === to) return { ok: false, error: "Ya está en esa etapa." };
  if (from === "ready") return { ok: false, error: "Un pedido listo no vuelve a preparación." };
  if (to === "queue") return { ok: false, error: "Un pedido que se empezó a armar no vuelve a Por preparar." };
  if (to === "ready") {
    if (from !== "lot-check") return { ok: false, error: "Antes de despacharlo, pasalo por Control de lote." };
    const missing = missingLots(order).length;
    if (missing) return { ok: false, lots: true, error: `Falta confirmar el lote de ${missing === 1 ? "1 producto" : `${missing} productos`}.` };
    return { ok: true, status: "READY" };
  }
  return { ok: true, status: "IN_PRODUCTION", stage: to };
}

/** Etapa siguiente (botón de la tarjeta), o null si ya está listo. */
export function nextColumn(column: PrepColumn): PrepColumn | null {
  const i = ORDER.indexOf(column);
  return i >= 0 && i < ORDER.length - 1 ? ORDER[i + 1]! : null;
}

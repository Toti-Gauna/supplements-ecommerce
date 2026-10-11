import type { OrderStatus } from "../../engine/orders";

/** Cola de producción tipo tablero: cada pedido pagado avanza por las etapas del taller hasta quedar listo. */
export type ProductionStage = "machine" | "finishing";
export type ProductionColumn = "queue" | "machine" | "finishing" | "ready";

export const PRODUCTION_COLUMNS: { id: ProductionColumn; label: string; hint: string }[] = [
  { id: "queue", label: "A fabricar", hint: "Pagados, esperando turno" },
  { id: "machine", label: "En máquina", hint: "Impresora 3D o láser" },
  { id: "finishing", label: "Terminación", hint: "Pintura, armado y packaging" },
  { id: "ready", label: "Listo", hint: "Para retirar o despachar" },
];

interface OrderLike {
  status: OrderStatus;
  stage?: ProductionStage;
}

export function columnOf(order: OrderLike): ProductionColumn | null {
  if (order.status === "PAID") return "queue";
  if (order.status === "IN_PRODUCTION") return order.stage === "finishing" ? "finishing" : "machine";
  return order.status === "READY" ? "ready" : null;
}

export type ProductionMove = { ok: true; status: OrderStatus; stage?: ProductionStage } | { ok: false; error: string };

const ORDER = PRODUCTION_COLUMNS.map((c) => c.id);

/** Qué cambia al mover una tarjeta: el estado del pedido (spec 5.2) y la etapa interna de producción. */
export function productionMove(order: OrderLike, to: ProductionColumn): ProductionMove {
  const from = columnOf(order);
  if (!from) return { ok: false, error: "Este pedido no está en la cola de producción." };
  if (from === to) return { ok: false, error: "Ya está en esa etapa." };
  if (ORDER.indexOf(to) < ORDER.indexOf(from) && !(from === "finishing" && to === "machine")) {
    return { ok: false, error: from === "ready" ? "Un pedido listo no vuelve a producción." : "Un pedido en producción no vuelve a la cola." };
  }
  if (from === "queue" && to === "ready") return { ok: false, error: "Primero pasalo por producción." };
  if (to === "ready") return { ok: true, status: "READY" };
  if (to === "queue") return { ok: false, error: "Un pedido en producción no vuelve a la cola." };
  return { ok: true, status: "IN_PRODUCTION", stage: to };
}

/** Siguiente etapa (botón "Avanzar"), o null si ya está listo. */
export function nextColumn(column: ProductionColumn): ProductionColumn | null {
  const i = ORDER.indexOf(column);
  return i >= 0 && i < ORDER.length - 1 ? ORDER[i + 1]! : null;
}

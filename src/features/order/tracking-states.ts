import type { TimelineStep } from "@/components/molecules/StatusTimeline";
import { brand } from "@/config/brand";
import type { OrderStatus } from "@/demo/engine/orders";
import { TRACKING_STAGES } from "@/demo/engine/tracking";
import type { WorkshopSettings } from "@/demo/fixtures/workshop";
import type { FulfillmentType } from "@/demo/types";
import { formatDateTime, formatDay, whenDay } from "@/lib/date";
import { arrivalText } from "./arrival";

/** Etapas de la línea de tiempo (spec 5.2), en el orden de `TRACKING_STAGES`. */
const FLOW = [
  { label: "Pedido recibido", description: "Reservamos tu pedido." },
  { label: "Pago en revisión", description: `${brand.name} verifica el ingreso de la transferencia o QR.` },
  { label: "Pagado", description: "Pago confirmado." },
  { label: "Armando tu pedido", description: "Controlamos lote y vencimiento de cada producto y lo embalamos." },
  { label: "Listo", description: "Embalado y precintado, listo para salir." },
  { label: "Enviado", description: "En camino con el cadete o el correo." },
  { label: "Entregado", description: "¡Que lo disfrutes!" },
];

/** Estados que se pueden probar en el seguimiento (solo cambian la vista, no el pedido). Arranca en el estado real. */
export const SAMPLE_STATES = [
  { id: "pending", label: "Esperando comprobante", current: 0 },
  { id: "review", label: "Pago en revisión", current: 1 },
  { id: "paid", label: "Pagado", current: 2 },
  { id: "production", label: "Armando tu pedido", current: 3 },
  { id: "ready", label: "Listo", current: 4 },
  { id: "shipped", label: "En camino", current: 5 },
  { id: "delivered", label: "Entregado", current: 7 },
] as const;

export type SampleStateId = (typeof SAMPLE_STATES)[number]["id"];

/** El estado de la vista que corresponde al estado real del pedido. */
export function stateForStatus(status: OrderStatus): SampleStateId {
  const i = TRACKING_STAGES.indexOf(status);
  return SAMPLE_STATES.find((s) => s.current === (i === TRACKING_STAGES.length - 1 ? 7 : i))?.id ?? "pending";
}

export const STATE_COPY: Record<SampleStateId, { title: string; progress: number; note: string }> = {
  pending: { title: "Esperando tu comprobante", progress: 0.04, note: `Subí el comprobante: ${brand.name} verifica el ingreso y arma tu pedido.` },
  review: { title: "Revisando tu pago", progress: 0.12, note: `Recibimos tu comprobante. ${brand.name} controla el ingreso en la cuenta y, cuando lo aprueba, arma tu pedido.` },
  paid: { title: "Pago confirmado", progress: 0.22, note: "Ya está aprobado: lo empezamos a armar enseguida." },
  production: { title: "Armando tu pedido", progress: 0.38, note: "Estamos preparando tu pedido: controlamos lote y vencimiento de cada producto." },
  ready: { title: "Listo", progress: 0.58, note: "Tu pedido está armado y precintado. Coordinamos la entrega por WhatsApp." },
  shipped: { title: "En camino", progress: 0.82, note: "Ya salió del local. El cadete te escribe antes de llegar." },
  delivered: { title: "Entregado", progress: 1, note: "Llegó a tu casa. ¡Que lo disfrutes! Si querés, contanos cómo quedó." },
};

/** Entrega estimada con el día de despacho del pedido (`day`): la misma fecha que se prometió en el checkout. */
export function etaFor(id: SampleStateId, fulfillment: FulfillmentType, day: string, today: string, settings: WorkshopSettings): string {
  const arrival = arrivalText(fulfillment, day, today, settings);
  if (id === "pending" || id === "review") return `${arrival}, si el pago se confirma a tiempo`;
  if (id === "ready") return fulfillment === "PICKUP" ? arrival : `Sale ${fulfillment === "SHIPPING" ? "al correo" : "con el cadete"} ${whenDay(day, today)}`;
  if (id === "delivered") return fulfillment === "SHIPPING" ? "Entregado por el correo" : `${fulfillment === "PICKUP" ? "Retirado" : "Entregado"} el ${formatDay(day)}`;
  return arrival;
}

/** Tira corta de la ficha de entrega: pedido, pago, armado con control de lote y entrega, según el estado real. */
export function deliveryStrip(status: OrderStatus, arrival: string): TimelineStep[] {
  const i = TRACKING_STAGES.indexOf(status);
  // Cada tramo está en curso entre `from` y `to` (índices de TRACKING_STAGES) y hecho después.
  const at = (from: number, to: number): TimelineStep["state"] => (i > to ? "done" : i >= from ? "current" : "pending");
  return [
    { label: "Pedido recibido", description: "", state: "done" },
    { label: status === "PAYMENT_REVIEW" ? "Pago en revisión" : "Pago", description: "", state: at(0, 1) },
    { label: "Armado y lote", description: "", state: at(2, 3) },
    { label: arrival, description: "", state: at(4, 5) },
  ];
}

/** Línea de tiempo hasta `current`, con la fecha y hora en que el pedido llegó a cada etapa (ISO, de su historial). */
export function timelineFor(current: number, dates: (string | undefined)[] = []): TimelineStep[] {
  return FLOW.map((s, i) => {
    const at = i <= current ? dates[i] : undefined;
    return { ...s, state: i < current ? "done" : i === current ? "current" : "pending", date: at ? formatDateTime(at) : undefined };
  });
}

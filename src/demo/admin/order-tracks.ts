import { isPaidOrLater } from "../engine/orders";
import type { AdminOrder } from "./types";

/**
 * Estado del cobro y estado de preparación y entrega, por separado (8.3.5). Los dos salen del estado único del engine:
 * no hay una segunda fuente. Un comprobante recibido nunca cuenta como pago.
 */
export type TrackTone = "neutral" | "warning" | "success" | "danger" | "brand";
export interface Track { label: string; tone: TrackTone }

const wasPaid = (o: AdminOrder) => isPaidOrLater(o.status) || o.log.some((l) => l.to === "PAID");

export function paymentTrack(o: AdminOrder): Track {
  if (o.status === "PENDING_PAYMENT") {
    if (o.proof?.status === "REJECTED") return { label: "Comprobante rechazado", tone: "danger" };
    return { label: o.paymentMethod === "CHECKOUT_PRO" ? "Esperando a Mercado Pago" : "Esperando comprobante", tone: "warning" };
  }
  if (o.status === "PAYMENT_REVIEW") return { label: "Comprobante en revisión", tone: "warning" };
  if (o.status === "RETURNED") return { label: "Devuelto", tone: "neutral" };
  if (o.status === "CANCELLED") return wasPaid(o) ? { label: "Pagado y cancelado", tone: "neutral" } : { label: "Sin cobrar (cancelado)", tone: "neutral" };
  if (o.inHand) return { label: "Cobrado en mano", tone: "success" };
  return { label: o.paymentMethod === "CHECKOUT_PRO" ? "Pagado con Mercado Pago" : "Pagado · aprobado a mano", tone: "success" };
}

export function fulfillmentTrack(o: AdminOrder): Track {
  switch (o.status) {
    case "PENDING_PAYMENT":
    case "PAYMENT_REVIEW": return { label: "Empieza cuando esté pagado", tone: "neutral" };
    case "PAID": return { label: "Por preparar", tone: "brand" };
    case "IN_PRODUCTION": return { label: o.stage === "lot-check" ? "En preparación · control de lote" : "En preparación · armando", tone: "brand" };
    case "READY": return { label: o.fulfillment === "PICKUP" ? "Listo para retirar" : "Listo para despachar", tone: "success" };
    case "SHIPPED": return { label: "Enviado", tone: "brand" };
    case "DELIVERED": return { label: "Entregado", tone: "success" };
    case "IN_CLAIM": return { label: "En reclamo", tone: "danger" };
    case "RETURNED": return { label: "Devuelto", tone: "neutral" };
    case "CANCELLED": return { label: "Cancelado", tone: "neutral" };
  }
}

/** Qué le toca hacer a Volta con este pedido ahora (o null si no hay nada pendiente). */
export function nextStep(o: AdminOrder): string | null {
  switch (o.status) {
    case "PENDING_PAYMENT": return o.paymentMethod === "CHECKOUT_PRO" ? "Esperar la confirmación de Mercado Pago" : "Esperar el comprobante del comprador";
    case "PAYMENT_REVIEW": return "Revisar el comprobante y aprobarlo o rechazarlo";
    case "PAID": return "Empezar a prepararlo";
    case "IN_PRODUCTION": return o.stage === "lot-check" ? "Controlar el lote de cada producto y marcarlo como listo" : "Terminar de armarlo y pasarlo a control de lote";
    case "READY": return o.fulfillment === "PICKUP" ? "Entregarlo cuando lo retiren" : "Despacharlo";
    case "SHIPPED": return "Confirmar la entrega";
    case "IN_CLAIM": return "Resolver el reclamo";
    default: return null;
  }
}

import type { OrderStatus } from "../engine/orders";
import type { EmailToken, Inline } from "./emails";
import { brand } from "@/config/brand";

/**
 * Mensajes de WhatsApp por estado del pedido (R4b): la versión corta de cada email, para mandarla a mano desde Pedidos
 * con "Escribirle por WhatsApp". Los estados sin email (reclamo, cancelado, devuelto) tienen solo su WhatsApp. Se
 * editan en Ajustes → Emails, junto al email; lo editado queda en `volta-demo:whatsapp`. Textos de MUESTRA.
 *
 * El número de cada cliente es el teléfono ficticio de su pedido (`admin-orders.ts`, característica 223 y 555): en la
 * demo el link abre WhatsApp con el mensaje escrito y nada se manda solo.
 */
export type WaMessageId =
  | "order-created" | "proof-received" | "proof-rejected" | "payment-approved" | "preparing"
  | "ready-pickup" | "ready-delivery" | "shipped" | "delivered" | "claim" | "cancelled" | "returned";

export interface WaMessage {
  id: WaMessageId;
  /** Estado del pedido en el que se usa (lo ve el dueño). */
  label: string;
  /** Cuándo corresponde, en una línea. */
  hint: string;
  status: OrderStatus;
  /** Plantilla de email que acompaña (sin esto, el estado solo tiene WhatsApp). */
  emailId?: string;
  text: Inline;
}

const t = (text: string) => ({ kind: "text" as const, text });
const k = (token: EmailToken) => ({ kind: "token" as const, token });
const store = brand.name;

export const WA_MESSAGES: WaMessage[] = [
  { id: "order-created", label: "Pendiente de pago", status: "PENDING_PAYMENT", emailId: "tpl-order-created", hint: "Todavía no pagó: un recordatorio amable.",
    text: [t("¡Hola "), k("customer.firstName"), t(`! Te escribimos de ${store} por tu pedido `), k("order.code"), t(" de "), k("order.total"), t(". Todavía no nos llegó el pago: si ya lo hiciste, mandanos el comprobante por acá y lo revisamos.")] },
  { id: "proof-received", label: "Comprobante en revisión", status: "PAYMENT_REVIEW", emailId: "tpl-proof-received", hint: "Subió el comprobante y lo estás mirando.",
    text: [t("¡Hola "), k("customer.firstName"), t("! Recibimos el comprobante del pedido "), k("order.code"), t(" ("), k("order.total"), t("). Lo controlamos contra la cuenta y te confirmamos por acá.")] },
  { id: "proof-rejected", label: "Pago no validado", status: "PENDING_PAYMENT", emailId: "tpl-proof-rejected", hint: "Rechazaste el comprobante: el motivo y cómo seguir.",
    text: [t("Hola "), k("customer.firstName"), t(", no pudimos validar el comprobante del pedido "), k("order.code"), t(". Motivo: "), k("order.rejectReason"), t(". ¿Nos mandás otro por acá?")] },
  { id: "payment-approved", label: "Pagado", status: "PAID", emailId: "tpl-payment-approved", hint: "Aprobaste el pago.",
    text: [t("¡Listo, "), k("customer.firstName"), t("! Aprobamos el pago del pedido "), k("order.code"), t(" ("), k("order.total"), t("). Ya lo armamos y lo tenés para el "), k("order.deliveryDate"), t(".")] },
  { id: "preparing", label: "En preparación", status: "IN_PRODUCTION", emailId: "tpl-preparing", hint: "Lo estás armando.",
    text: [t("¡Hola "), k("customer.firstName"), t("! Estamos armando tu pedido "), k("order.code"), t(" y controlando lote y vencimiento de cada producto. Lo tenés para el "), k("order.deliveryDate"), t(".")] },
  { id: "ready-pickup", label: "Listo para retirar", status: "READY", emailId: "tpl-ready-pickup", hint: "Retira en el local.",
    text: [t("¡"), k("customer.firstName"), t(", tu pedido "), k("order.code"), t(" está listo para retirar! Pasá por el local en horario comercial y decí el código.")] },
  { id: "ready-delivery", label: "Listo para salir", status: "READY", emailId: "tpl-ready-delivery", hint: "Sale con el cadete o por correo.",
    text: [t("¡Hola "), k("customer.firstName"), t("! Tu pedido "), k("order.code"), t(" ya está armado y controlado. Sale por "), k("order.fulfillment"), t(" y te avisamos cuando esté en camino.")] },
  { id: "shipped", label: "Enviado", status: "SHIPPED", emailId: "tpl-shipped", hint: "Salió con el cadete o el correo.",
    text: [t("¡"), k("customer.firstName"), t(", tu pedido "), k("order.code"), t(" va en camino ("), k("order.fulfillment"), t(")! Cualquier cosa, escribinos por acá.")] },
  { id: "delivered", label: "Entregado", status: "DELIVERED", emailId: "tpl-delivered", hint: "Ya lo tiene: cómo le fue.",
    text: [t("¡Hola "), k("customer.firstName"), t("! ¿Llegó todo bien con el pedido "), k("order.code"), t("? Si tenés dudas de cómo tomar algo, preguntanos. Antes de que se te termine te avisamos.")] },
  { id: "claim", label: "En reclamo", status: "IN_CLAIM", hint: "Hizo un reclamo: que sepa que lo estás viendo.",
    text: [t("Hola "), k("customer.firstName"), t(", recibimos tu reclamo por el pedido "), k("order.code"), t(". Ya lo estamos viendo y te respondemos por acá.")] },
  { id: "cancelled", label: "Cancelado", status: "CANCELLED", hint: "Se canceló el pedido.",
    text: [t("Hola "), k("customer.firstName"), t(", cancelamos el pedido "), k("order.code"), t(". Si fue un error o lo querés igual, avisanos y lo armamos.")] },
  { id: "returned", label: "Devuelto", status: "RETURNED", hint: "Se registró la devolución.",
    text: [t("Hola "), k("customer.firstName"), t(", registramos la devolución del pedido "), k("order.code"), t(". Te escribimos para coordinar el reintegro de "), k("order.total"), t(".")] },
];

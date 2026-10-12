import type { ArtKey, FulfillmentType } from "../types";

/**
 * Emails automáticos de una tienda de suplementos (Fase 7): plantillas por bloques con datos dinámicos como fichas.
 * En la demo nada se envía: los "enviados" quedan en una bandeja de salida del panel. En producción los arma React
 * Email y los envía Nodemailer desde el servidor.
 */

/** Momentos del pedido (en el orden del recorrido) y el aviso de recompra. */
export type EmailTrigger =
  | "order-created" | "proof-received" | "payment-approved" | "proof-rejected" | "preparing" | "ready" | "shipped" | "delivered" | "repurchase";

export const EMAIL_TRIGGERS: EmailTrigger[] = ["order-created", "proof-received", "payment-approved", "proof-rejected", "preparing", "ready", "shipped", "delivered", "repurchase"];

export const TRIGGER_LABEL: Record<EmailTrigger, string> = {
  "order-created": "Compra recibida",
  "proof-received": "Comprobante recibido",
  "payment-approved": "Pago aprobado",
  "proof-rejected": "Pago no validado",
  preparing: "Preparando el pedido",
  ready: "Pedido listo",
  shipped: "En camino",
  delivered: "Entregado",
  repurchase: "Se le termina el pote",
};

export const TRIGGER_HINT: Record<EmailTrigger, string> = {
  "order-created": "Cuando el cliente confirma la compra en la tienda.",
  "proof-received": "Cuando el cliente sube el comprobante de la transferencia o del QR: le avisa que lo estás revisando.",
  "payment-approved": "Cuando aprobás el comprobante o llega la confirmación de Mercado Pago.",
  "proof-rejected": "Cuando rechazás un comprobante: le cuenta el motivo y cómo mandar otro.",
  preparing: "Cuando el pedido pasa a preparación: se arma con los productos del local y se controla el lote.",
  ready: "Cuando el pedido queda armado y controlado: listo para retirar o para salir con el cadete o el correo.",
  shipped: "Cuando el pedido sale con el cadete o por correo.",
  delivered: "Cuando el pedido se entrega o se retira: cómo tomar cada producto.",
  repurchase: "Unos días antes de que se le termine lo que compró, según los servicios del envase (desde la ficha del cliente).",
};

/** Datos que se insertan como fichas. Nunca se muestran como código: el editor y la vista previa usan la etiqueta. */
export type EmailToken =
  | "customer.firstName" | "customer.name" | "order.code" | "order.total" | "order.deliveryDate" | "order.fulfillment"
  | "order.status" | "order.rejectReason" | "refill.product" | "refill.date";

export const TOKEN_LABEL: Record<EmailToken, string> = {
  "customer.firstName": "Nombre del cliente",
  "customer.name": "Nombre completo",
  "order.code": "Código del pedido",
  "order.total": "Total del pedido",
  "order.deliveryDate": "Fecha de entrega",
  "order.fulfillment": "Forma de entrega",
  "order.status": "Estado del pedido",
  "order.rejectReason": "Motivo del rechazo",
  "refill.product": "Producto que se termina",
  "refill.date": "Cuándo se termina",
};

export type InlinePart = { kind: "text"; text: string } | { kind: "token"; token: EmailToken };
export type Inline = InlinePart[];

export type ButtonLink = "tracking" | "shop" | "club" | "whatsapp" | "product";

export const LINK_LABEL: Record<ButtonLink, string> = {
  tracking: "Seguimiento del pedido", shop: "Tienda", club: "Club Volta", whatsapp: "WhatsApp de la tienda", product: "Ficha del producto que se termina",
};

export type EmailBlock =
  | { id: string; type: "header" }
  | { id: string; type: "heading"; content: Inline }
  | { id: string; type: "text"; content: Inline }
  | { id: string; type: "image"; art: ArtKey; caption: Inline }
  | { id: string; type: "button"; label: Inline; link: ButtonLink }
  | { id: string; type: "order-card" }
  | { id: string; type: "products" }
  | { id: string; type: "usage" }
  | { id: string; type: "tracking" }
  | { id: string; type: "refill" }
  | { id: string; type: "divider" }
  | { id: string; type: "footer" };

export type EmailBlockType = EmailBlock["type"];

export const BLOCK_LABEL: Record<EmailBlockType, string> = {
  header: "Encabezado con logo",
  heading: "Título",
  text: "Texto",
  image: "Imagen",
  button: "Botón",
  "order-card": "Tarjeta del pedido",
  products: "Productos del pedido",
  usage: "Cómo tomarlo",
  tracking: "Seguimiento",
  refill: "Producto para reponer",
  divider: "Separador",
  footer: "Pie",
};

export interface EmailTemplate {
  id: string;
  name: string;
  trigger: EmailTrigger;
  active: boolean;
  /** Solo para pedidos con estas formas de entrega (sin esto, para todos). */
  only?: FulfillmentType[];
  subject: Inline;
  preheader: Inline;
  blocks: EmailBlock[];
}

const t = (text: string): InlinePart => ({ kind: "text", text });
const k = (token: EmailToken): InlinePart => ({ kind: "token", token });

let n = 0;
const id = () => `b${++n}`;
const head = (): EmailBlock => ({ id: id(), type: "header" });
const foot = (): EmailBlock => ({ id: id(), type: "footer" });
const h = (...content: Inline): EmailBlock => ({ id: id(), type: "heading", content });
const p = (...content: Inline): EmailBlock => ({ id: id(), type: "text", content });
const btn = (link: ButtonLink, ...label: Inline): EmailBlock => ({ id: id(), type: "button", link, label });
const block = (type: "order-card" | "products" | "usage" | "tracking" | "refill"): EmailBlock => ({ id: id(), type });

/** Plantillas de muestra con la marca, en el orden del recorrido del pedido. */
export const emailTemplates: EmailTemplate[] = [
  {
    id: "tpl-order-created", name: "Recibimos tu pedido", trigger: "order-created", active: true,
    subject: [t("¡Recibimos tu pedido, "), k("customer.firstName"), t("! · "), k("order.code")],
    preheader: [t("Te avisamos en cada paso: pago, armado y entrega.")],
    blocks: [head(), h(t("Pedido recibido, "), k("customer.firstName")),
      p(t("Ya tenemos tu pedido "), k("order.code"), t(". Apenas se confirme el pago lo armamos con productos originales, con lote y vencimiento a la vista.")),
      block("order-card"), block("products"), btn("tracking", t("Seguir mi pedido")), foot()],
  },
  {
    id: "tpl-proof-received", name: "Estamos revisando tu pago", trigger: "proof-received", active: true,
    subject: [t("Recibimos tu comprobante · "), k("order.code")],
    preheader: [t("Lo revisamos y te confirmamos por acá.")],
    blocks: [head(), h(t("Comprobante recibido")),
      p(t("Hola "), k("customer.firstName"), t(", ya tenemos el comprobante del pedido "), k("order.code"), t(". Lo controlamos contra la cuenta (en días hábiles, en el día) y te avisamos apenas esté aprobado.")),
      block("order-card"), foot()],
  },
  {
    id: "tpl-payment-approved", name: "Pago aprobado", trigger: "payment-approved", active: true,
    subject: [t("Pago aprobado: pedido "), k("order.code")],
    preheader: [t("Ya lo estamos armando.")],
    blocks: [head(), h(t("¡Pago aprobado!")),
      p(t("Hola "), k("customer.firstName"), t(", aprobamos el pago. Tu pedido pasa a preparación y lo tenés para el "), k("order.deliveryDate"), t(".")),
      block("order-card"), block("tracking"), btn("tracking", t("Ver el seguimiento")), foot()],
  },
  {
    id: "tpl-proof-rejected", name: "No pudimos validar tu pago", trigger: "proof-rejected", active: true,
    subject: [t("Revisá el pago del pedido "), k("order.code")],
    preheader: [t("Te contamos qué pasó y cómo seguir.")],
    blocks: [head(), h(t("No pudimos validar el comprobante")),
      p(t("Hola "), k("customer.firstName"), t(", revisamos el comprobante del pedido "), k("order.code"), t(" y no lo pudimos aprobar. Motivo: "), k("order.rejectReason"), t(".")),
      p(t("Podés subir otro desde el seguimiento del pedido o escribirnos por WhatsApp y lo vemos juntos. Tu pedido sigue esperando el pago.")),
      btn("tracking", t("Subir otro comprobante")), foot()],
  },
  {
    id: "tpl-preparing", name: "Preparando tu pedido", trigger: "preparing", active: true,
    subject: [t("Estamos armando tu pedido "), k("order.code")],
    preheader: [t("Controlamos el lote y el vencimiento de cada producto.")],
    blocks: [head(), h(t("Preparando tu pedido")),
      p(t("Hola "), k("customer.firstName"), t(", ya estamos armando tu pedido: buscamos cada producto, controlamos lote y vencimiento y lo dejamos listo para el "), k("order.deliveryDate"), t(".")),
      block("tracking"), block("products"), foot()],
  },
  {
    id: "tpl-ready-pickup", name: "Listo para retirar", trigger: "ready", active: true, only: ["PICKUP"],
    subject: [t("¡Tu pedido "), k("order.code"), t(" está listo para retirar!")],
    preheader: [t("Pasá por el local con el código del pedido.")],
    blocks: [head(), h(t("Listo para retirar, "), k("customer.firstName")),
      p(t("Tu pedido ya está armado y controlado. Pasá por el local en horario comercial y decí el código "), k("order.code"), t(".")),
      block("products"), btn("whatsapp", t("Coordinar el retiro")), foot()],
  },
  {
    id: "tpl-ready-delivery", name: "Listo para salir", trigger: "ready", active: true, only: ["LOCAL_DELIVERY", "SHIPPING"],
    subject: [t("Tu pedido "), k("order.code"), t(" está listo para salir")],
    preheader: [k("order.fulfillment"), t(": te avisamos cuando salga.")],
    blocks: [head(), h(t("Armado y controlado")),
      p(t("Hola "), k("customer.firstName"), t(", tu pedido ya está armado, con el lote y el vencimiento de cada producto controlados. Sale por "), k("order.fulfillment"), t(" y te avisamos apenas esté en camino.")),
      block("products"), block("tracking"), foot()],
  },
  {
    id: "tpl-shipped", name: "Va en camino", trigger: "shipped", active: true,
    subject: [t("Tu pedido "), k("order.code"), t(" va en camino")],
    preheader: [k("order.fulfillment"), t(". Seguilo desde el link.")],
    blocks: [head(), h(t("¡Va en camino!")),
      p(t("Hola "), k("customer.firstName"), t(", tu pedido ya salió ("), k("order.fulfillment"), t("). Con cadete te llega hoy; por correo, lo seguís desde el link.")),
      block("tracking"), btn("tracking", t("Seguir mi pedido")), foot()],
  },
  {
    id: "tpl-delivered", name: "Ya lo tenés: así se toma", trigger: "delivered", active: true,
    subject: [t("Ya tenés tu pedido, "), k("customer.firstName"), t(": así se toma")],
    preheader: [t("Cómo tomar cada producto y cuándo reponer.")],
    blocks: [head(), h(t("¡Ya es tuyo, "), k("customer.firstName"), t("!")),
      p(t("Te dejamos cómo tomar cada producto. Es orientativo: si tenés una condición de salud, consultá con tu médico o nutricionista.")),
      block("usage"), p(t("Unos días antes de que se te termine te avisamos, así no cortás la rutina.")),
      btn("club", t("Sumar puntos en el Club")), foot()],
  },
  {
    id: "tpl-repurchase", name: "Tu pote se está por terminar", trigger: "repurchase", active: true,
    subject: [k("customer.firstName"), t(", tu "), k("refill.product"), t(" se está por terminar")],
    preheader: [t("Reponé antes de cortar la rutina.")],
    blocks: [head(), h(t("Se te está por terminar")),
      p(t("Hola "), k("customer.firstName"), t(", por los servicios del envase que llevaste, tu "), k("refill.product"), t(" se termina cerca del "), k("refill.date"), t(". Si lo pedís hoy, en Mar del Plata te llega con cadete en el día.")),
      block("refill"), btn("product", t("Volver a pedirlo")),
      p(t("¿Querés cambiar de sabor o pasar al tamaño grande? En la ficha ves el precio por servicio de cada uno.")), foot()],
  },
];

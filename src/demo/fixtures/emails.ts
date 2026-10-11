import type { ArtKey } from "../types";

/**
 * Emails automáticos (pedido de Ignacio, fuera de la especificación): plantillas por bloques con datos dinámicos
 * como fichas. En la demo nada se envía: los "enviados" quedan en una bandeja de salida del panel. En producción
 * los arma React Email y los envía Nodemailer, como dice la spec.
 */

export type EmailTrigger = "order-created" | "custom-received" | "payment-approved" | "in-production" | "ready" | "shipped" | "pet-birthday";

export const TRIGGER_LABEL: Record<EmailTrigger, string> = {
  "order-created": "Compra realizada",
  "custom-received": "Pedido personalizado recibido",
  "payment-approved": "Pago aprobado",
  "in-production": "En producción",
  ready: "Listo para entregar",
  shipped: "Enviado",
  "pet-birthday": "Cumpleaños de la mascota",
};

export const TRIGGER_HINT: Record<EmailTrigger, string> = {
  "order-created": "Cuando el cliente confirma la compra en la tienda.",
  "custom-received": "Cuando la compra trae algo personalizado: confirma que recibimos el diseño aprobado.",
  "payment-approved": "Cuando se aprueba el comprobante o llega la confirmación de Mercado Pago.",
  "in-production": "Cuando el pedido pasa a producción.",
  ready: "Cuando el pedido está listo para retirar o despachar.",
  shipped: "Cuando el pedido sale por cadete o por correo.",
  "pet-birthday": "El día del cumpleaños de una mascota cargada en la ficha del cliente.",
};

/** Datos que se insertan como fichas. Nunca se muestran como código: el editor y la vista previa usan la etiqueta. */
export type EmailToken =
  | "customer.firstName" | "customer.name" | "order.code" | "order.total" | "order.deliveryDate" | "order.fulfillment" | "order.status" | "pet.name";

export const TOKEN_LABEL: Record<EmailToken, string> = {
  "customer.firstName": "Nombre del cliente",
  "customer.name": "Nombre completo",
  "order.code": "Código del pedido",
  "order.total": "Total del pedido",
  "order.deliveryDate": "Fecha de entrega",
  "order.fulfillment": "Forma de entrega",
  "order.status": "Estado del pedido",
  "pet.name": "Nombre de la mascota",
};

/** Fichas que dependen de un pedido o de una mascota (las de mascota solo tienen sentido en su disparador). */
export const ORDER_TOKENS: EmailToken[] = ["order.code", "order.total", "order.deliveryDate", "order.fulfillment", "order.status"];

export type InlinePart = { kind: "text"; text: string } | { kind: "token"; token: EmailToken };
export type Inline = InlinePart[];

export type ButtonLink = "tracking" | "shop" | "club" | "whatsapp";

export const LINK_LABEL: Record<ButtonLink, string> = { tracking: "Seguimiento del pedido", shop: "Tienda", club: "Club Volta", whatsapp: "WhatsApp del taller" };

export type EmailBlock =
  | { id: string; type: "header" }
  | { id: string; type: "heading"; content: Inline }
  | { id: string; type: "text"; content: Inline }
  | { id: string; type: "image"; art: ArtKey; caption: Inline }
  | { id: string; type: "button"; label: Inline; link: ButtonLink }
  | { id: string; type: "order-card" }
  | { id: string; type: "products" }
  | { id: string; type: "tracking" }
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
  tracking: "Seguimiento",
  divider: "Separador",
  footer: "Pie",
};

export interface EmailTemplate {
  id: string;
  name: string;
  trigger: EmailTrigger;
  active: boolean;
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

/** Plantillas de muestra con la marca, una por disparador. */
export const emailTemplates: EmailTemplate[] = [
  {
    id: "tpl-order-created", name: "Gracias por tu compra", trigger: "order-created", active: true,
    subject: [t("¡Gracias por tu compra, "), k("customer.firstName"), t("! Pedido "), k("order.code")],
    preheader: [t("Te contamos cómo sigue tu pedido.")],
    blocks: [head(), h(t("¡Gracias, "), k("customer.firstName"), t("!")),
      p(t("Recibimos tu pedido "), k("order.code"), t(". Apenas confirmemos el pago lo pasamos al taller y te avisamos en cada paso.")),
      { id: id(), type: "order-card" }, { id: id(), type: "products" }, btn("tracking", t("Seguir mi pedido")), foot()],
  },
  {
    id: "tpl-custom-received", name: "Recibimos tu diseño", trigger: "custom-received", active: true,
    subject: [t("Recibimos tu diseño, "), k("customer.firstName")],
    preheader: [t("Lo hacemos tal cual lo aprobaste.")],
    blocks: [head(), h(t("Tu diseño ya está en el taller")),
      p(t("Hola "), k("customer.firstName"), t(", guardamos la vista previa que aprobaste. La vamos a fabricar exactamente así.")),
      { id: id(), type: "products" }, p(t("Si querés cambiar algo, escribinos antes de que el pedido pase a producción.")), btn("whatsapp", t("Escribir al taller")), foot()],
  },
  {
    id: "tpl-payment-approved", name: "Pago aprobado", trigger: "payment-approved", active: true,
    subject: [t("Pago aprobado: pedido "), k("order.code")],
    preheader: [t("Ya entra al taller.")],
    blocks: [head(), h(t("¡Pago aprobado!")),
      p(t("Hola "), k("customer.firstName"), t(", ya acreditamos el pago. Tu pedido entra en la cola del taller y lo tenemos para el "), k("order.deliveryDate"), t(".")),
      { id: id(), type: "order-card" }, btn("tracking", t("Ver el seguimiento")), foot()],
  },
  {
    id: "tpl-in-production", name: "Tu pedido está en producción", trigger: "in-production", active: true,
    subject: [t("¡Manos a la obra! Tu pedido "), k("order.code"), t(" está en producción")],
    preheader: [t("Lo estamos haciendo a mano en Mar del Plata.")],
    blocks: [head(), { id: id(), type: "image", art: "tub", caption: [t("Así preparamos cada pedido.")] },
      h(t("Tu pedido está en producción")),
      p(t("Hola "), k("customer.firstName"), t(", ya estamos trabajando en tu pedido. Lo tenemos listo para el "), k("order.deliveryDate"), t(".")),
      { id: id(), type: "tracking" }, foot()],
  },
  {
    id: "tpl-ready", name: "Listo para entregar", trigger: "ready", active: true,
    subject: [t("Tu pedido "), k("order.code"), t(" está listo")],
    preheader: [k("order.fulfillment"), t(": te contamos cómo sigue.")],
    blocks: [head(), h(t("¡Está listo, "), k("customer.firstName"), t("!")),
      p(t("Terminamos tu pedido. Forma de entrega: "), k("order.fulfillment"), t(". Si es retiro, coordinamos día y horario por WhatsApp.")),
      { id: id(), type: "products" }, btn("whatsapp", t("Coordinar la entrega")), foot()],
  },
  {
    id: "tpl-shipped", name: "Pedido enviado", trigger: "shipped", active: true,
    subject: [t("Tu pedido "), k("order.code"), t(" va en camino")],
    preheader: [t("Seguilo desde el link.")],
    blocks: [head(), h(t("¡Va en camino!")),
      p(t("Hola "), k("customer.firstName"), t(", tu pedido ya salió. Podés seguirlo desde acá.")),
      { id: id(), type: "tracking" }, btn("tracking", t("Seguir mi pedido")), foot()],
  },
  {
    id: "tpl-pet-birthday", name: "Feliz cumple", trigger: "pet-birthday", active: true,
    subject: [t("¡Feliz cumple, "), k("pet.name"), t("! 🎂")],
    preheader: [t("Un saludo del taller de Volta.")],
    blocks: [head(), { id: id(), type: "image", art: "shaker", caption: [t("Un regalo para festejar.")] },
      h(t("¡Feliz cumple, "), k("pet.name"), t("!")),
      p(t("Hola "), k("customer.firstName"), t(", hoy es un día especial. Desde el taller le mandamos un abrazo enorme a "), k("pet.name"), t(".")),
      btn("shop", t("Ver regalos con su nombre")), foot()],
  },
];

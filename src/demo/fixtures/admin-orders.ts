import type { AdminOrder } from "../admin/types";
import { HOUSE_SHAKER_SLUG } from "./house";
import { ORDER_PREFIX } from "./house";

/** Fecha de referencia de la demo: todas las cifras "de hoy/semana/mes" se calculan contra esta fecha. */
export const DEMO_TODAY = "2026-10-05";

type Seed = Omit<AdminOrder, "total" | "notes" | "log" | "coupon"> & { notes?: string[]; log?: AdminOrder["log"]; /** Cupón de la campaña usado en la compra (el descuento se calcula al cargar). */ couponCode?: string };

/** Pedidos FICTICIOS. Nombres, emails y teléfonos inventados (dominio ejemplo.com). */
export const orderSeeds: Seed[] = [
  { code: `${ORDER_PREFIX}-000126`, createdAt: "2026-10-04T09:12:00-03:00", customer: { name: "Lucía Fernández", email: "lucia.f@ejemplo.com", phone: "223 555-0126" }, userId: "u-lucia", status: "PENDING_PAYMENT", fulfillment: "SHIPPING", paymentMethod: "CHECKOUT_PRO", address: "Calle Falsa 123, Tandil (7000)", promisedDate: "2026-10-19",
    lines: [{ id: "a", productSlug: "ionic-whey", variantId: "iw-chocolate-2lb", quantity: 1 }] },
  { code: `${ORDER_PREFIX}-000125`, createdAt: "2026-10-03T19:40:00-03:00", customer: { name: "Martín Gómez", email: "martin.g@ejemplo.com", phone: "223 555-0125" }, userId: null, status: "PENDING_PAYMENT", fulfillment: "LOCAL_DELIVERY", paymentMethod: "BANK_TRANSFER", address: "Av. Colón 1500, Mar del Plata (7600)", promisedDate: "2026-10-09",
    lines: [{ id: "a", productSlug: "overvolt-pre", variantId: "ov-frutos-rojos-300", quantity: 1 }] },
  { code: `${ORDER_PREFIX}-000124`, createdAt: "2026-10-03T11:05:00-03:00", customer: { name: "Sofía Ruiz", email: "sofia.r@ejemplo.com", phone: "223 555-0124" }, userId: "u-sofia", status: "PAYMENT_REVIEW", fulfillment: "PICKUP", paymentMethod: "QR_MANUAL", promisedDate: "2026-10-05",
    lines: [{ id: "a", productSlug: "barra-proteica", variantId: "bp-chocolate-u", quantity: 2 }, { id: "b", productSlug: HOUSE_SHAKER_SLUG, variantId: "sh-voltio", quantity: 1 }],
    proof: { fileName: "captura-qr-124.jpg", receivedAt: "2026-10-03T11:20:00-03:00", status: "IN_REVIEW" } },
  { code: `${ORDER_PREFIX}-000123`, createdAt: "2026-10-02T16:30:00-03:00", customer: { name: "Diego Álvarez", email: "diego.a@ejemplo.com", phone: "223 555-0123" }, userId: "u-diego", status: "PAYMENT_REVIEW", fulfillment: "LOCAL_DELIVERY", paymentMethod: "BANK_TRANSFER", address: "Güemes 2800, Mar del Plata (7600)", promisedDate: "2026-10-14",
    lines: [{ id: "a", productSlug: "mass-gainer", variantId: "mg-chocolate-3kg", quantity: 1 }],
    proof: { fileName: "comprobante-123.pdf", receivedAt: "2026-10-02T17:02:00-03:00", status: "IN_REVIEW" } },
  { code: `${ORDER_PREFIX}-000122`, createdAt: "2026-10-02T10:15:00-03:00", customer: { name: "Valentina Sosa", email: "vale.s@ejemplo.com", phone: "223 555-0122" }, couponCode: "MAMA15", userId: "u-vale", status: "PAID", fulfillment: "SHIPPING", paymentMethod: "CHECKOUT_PRO", address: "San Martín 450, Necochea (7630)", promisedDate: "2026-10-26",
    lines: [{ id: "a", productSlug: "isolate-zero", variantId: "iz-chocolate-2lb", quantity: 1 }] },
  { code: `${ORDER_PREFIX}-000121`, createdAt: "2026-10-01T13:00:00-03:00", customer: { name: "Julián Paz", email: "julian.p@ejemplo.com", phone: "223 555-0121" }, userId: "u-julian", status: "IN_PRODUCTION", fulfillment: "LOCAL_DELIVERY", paymentMethod: "QR_MANUAL", address: "Rivadavia 3200, Mar del Plata (7600)", promisedDate: "2026-10-08", stage: "lot-check",
    lines: [{ id: "a", productSlug: "creatina-monohidrato", variantId: "cm-sin-sabor-500", quantity: 1 }],
    proof: { fileName: "qr-121.png", receivedAt: "2026-10-01T13:30:00-03:00", status: "APPROVED" }, notes: ["Pidió sumar un sachet de muestra de pre-entreno."] },
  { code: `${ORDER_PREFIX}-000120`, createdAt: "2026-09-30T18:20:00-03:00", customer: { name: "Camila Torres", email: "cami.t@ejemplo.com", phone: "223 555-0120" }, userId: "u-sofia", status: "READY", fulfillment: "LOCAL_DELIVERY", paymentMethod: "BANK_TRANSFER", address: "Alem 2700, Mar del Plata (7600)", promisedDate: "2026-10-05",
    lines: [{ id: "a", productSlug: "electrolitos", variantId: "ev-limon-x10", quantity: 2 }],
    proof: { fileName: "transferencia-120.pdf", receivedAt: "2026-09-30T18:45:00-03:00", status: "APPROVED" } },
  { code: `${ORDER_PREFIX}-000119`, createdAt: "2026-09-29T09:00:00-03:00", customer: { name: "Diego Álvarez", email: "diego.a@ejemplo.com", phone: "223 555-0123" }, userId: "u-diego", status: "SHIPPED", fulfillment: "SHIPPING", paymentMethod: "CHECKOUT_PRO", address: "Mitre 900, Balcarce (7620)", promisedDate: "2026-09-30",
    lines: [{ id: "a", productSlug: "overvolt-pre", variantId: "ov-limon-300", quantity: 1 }, { id: "b", productSlug: "magnesio-tiza", variantId: "mt-56", quantity: 2 }] },
  { code: `${ORDER_PREFIX}-000118`, createdAt: "2026-09-27T15:10:00-03:00", customer: { name: "Julián Paz", email: "julian.p@ejemplo.com", phone: "223 555-0121" }, userId: "u-julian", status: "DELIVERED", fulfillment: "PICKUP", paymentMethod: "CHECKOUT_PRO", promisedDate: "2026-09-28",
    lines: [{ id: "a", productSlug: "omega-3", variantId: "o3-60", quantity: 1 }] },
  { code: `${ORDER_PREFIX}-000117`, createdAt: "2026-09-26T12:00:00-03:00", customer: { name: "Rocío Díaz", email: "rocio.d@ejemplo.com", phone: "223 555-0117" }, userId: null, status: "CANCELLED", fulfillment: "PICKUP", paymentMethod: "BANK_TRANSFER",
    lines: [{ id: "a", productSlug: "night-casein", variantId: "nc-vainilla-2lb", quantity: 1 }] },
  { code: `${ORDER_PREFIX}-000116`, createdAt: "2026-09-22T10:30:00-03:00", customer: { name: "Valentina Sosa", email: "vale.s@ejemplo.com", phone: "223 555-0122" }, userId: "u-vale", status: "IN_CLAIM", prevStatus: "DELIVERED", fulfillment: "SHIPPING", paymentMethod: "CHECKOUT_PRO", address: "San Martín 450, Necochea (7630)",
    lines: [{ id: "a", productSlug: "ionic-whey", variantId: "iw-vainilla-5lb", quantity: 1 }] },
  { code: `${ORDER_PREFIX}-000115`, createdAt: "2026-09-24T17:40:00-03:00", customer: { name: "Agustina Molina", email: "agus.m@ejemplo.com", phone: "223 555-0115" }, userId: null, status: "IN_PRODUCTION", fulfillment: "LOCAL_DELIVERY", paymentMethod: "QR_MANUAL", address: "Luro 3100, Mar del Plata (7600)", promisedDate: "2026-10-02", stage: "lot-check",
    lines: [{ id: "a", productSlug: "proteina-vegana", variantId: "pv-chocolate-1kg", quantity: 1 }],
    proof: { fileName: "qr-115.png", receivedAt: "2026-09-24T18:00:00-03:00", status: "APPROVED" }, notes: ["Pidió cambiar a sabor chocolate: confirmado por WhatsApp."] },
  { code: `${ORDER_PREFIX}-000114`, createdAt: "2026-09-28T12:30:00-03:00", customer: { name: "Carla Benítez", email: "carla.b@ejemplo.com", phone: "223 555-0114" }, userId: null, status: "IN_PRODUCTION", fulfillment: "SHIPPING", paymentMethod: "CHECKOUT_PRO", address: "Belgrano 820, Miramar (7607)", promisedDate: "2026-10-07", stage: "picking",
    lines: [{ id: "a", productSlug: "creatina-gomitas", variantId: "cg-frutos-rojos-90", quantity: 2 }] },
  { code: `${ORDER_PREFIX}-000113`, createdAt: "2026-10-01T09:20:00-03:00", customer: { name: "Ana López", email: "ana.l@ejemplo.com", phone: "223 555-0113" }, userId: null, status: "PAID", fulfillment: "PICKUP", paymentMethod: "BANK_TRANSFER", promisedDate: "2026-10-08",
    lines: [{ id: "a", productSlug: "barra-proteica", variantId: "bp-mani-x12", quantity: 2 }],
    proof: { fileName: "transferencia-113.pdf", receivedAt: "2026-10-01T10:05:00-03:00", status: "APPROVED" }, notes: ["Pedido para su gimnasio (sábado 10/10). Retira el jueves."] },
  { code: `${ORDER_PREFIX}-000111`, createdAt: "2026-10-02T08:45:00-03:00", customer: { name: "Julián Paz", email: "julian.p@ejemplo.com", phone: "223 555-0121" }, couponCode: "MAMA15", userId: "u-julian", status: "PAID", fulfillment: "LOCAL_DELIVERY", paymentMethod: "CHECKOUT_PRO", address: "Rivadavia 3200, Mar del Plata (7600)", promisedDate: "2026-10-08",
    lines: [{ id: "a", productSlug: "colageno", variantId: "co-limon-300", quantity: 1 }] },
  { code: `${ORDER_PREFIX}-000110`, createdAt: "2026-09-30T15:15:00-03:00", customer: { name: "Rocío Díaz", email: "rocio.d@ejemplo.com", phone: "223 555-0117" }, userId: null, status: "IN_PRODUCTION", fulfillment: "LOCAL_DELIVERY", paymentMethod: "BANK_TRANSFER", address: "Independencia 1900, Mar del Plata (7600)", promisedDate: "2026-10-09", stage: "picking",
    lines: [{ id: "a", productSlug: "bcaa-211", variantId: "bc-uva-300", quantity: 1 }],
    proof: { fileName: "transferencia-110.pdf", receivedAt: "2026-09-30T16:00:00-03:00", status: "APPROVED" } },
  { code: `${ORDER_PREFIX}-000109`, createdAt: "2026-10-01T18:05:00-03:00", customer: { name: "Martín Gómez", email: "martin.g@ejemplo.com", phone: "223 555-0125" }, userId: null, status: "PAID", fulfillment: "PICKUP", paymentMethod: "QR_MANUAL", promisedDate: "2026-10-09",
    lines: [{ id: "a", productSlug: "alfajor-proteico", variantId: "ap-dulce-de-leche-x6", quantity: 1 }],
    proof: { fileName: "qr-109.png", receivedAt: "2026-10-01T18:20:00-03:00", status: "APPROVED" } },
  // Compras anteriores (Fase 6): con ellas se calcula a quién se le termina el pote esta semana y quién está atrasado.
  { code: `${ORDER_PREFIX}-000108`, createdAt: "2026-09-14T17:45:00-03:00", customer: { name: "Nicolás Romero", email: "nico.r@ejemplo.com", phone: "223 555-0108" }, userId: null, status: "DELIVERED", fulfillment: "LOCAL_DELIVERY", paymentMethod: "CHECKOUT_PRO", address: "Brown 2600, Mar del Plata (7600)", promisedDate: "2026-09-15",
    lines: [{ id: "a", productSlug: "mass-gainer", variantId: "mg-dulce-de-leche-3kg", quantity: 1 }] },
  { code: `${ORDER_PREFIX}-000107`, createdAt: "2026-09-07T10:15:00-03:00", customer: { name: "Juan Ibarra", email: "juan.i@ejemplo.com", phone: "223 555-0103" }, userId: null, status: "DELIVERED", fulfillment: "LOCAL_DELIVERY", paymentMethod: "CHECKOUT_PRO", address: "Funes 2100, Mar del Plata (7600)", promisedDate: "2026-09-08",
    lines: [{ id: "a", productSlug: "ionic-whey", variantId: "iw-chocolate-2lb", quantity: 1 }, { id: "b", productSlug: "creatina-monohidrato", variantId: "cm-sin-sabor-300", quantity: 1 }] },
  { code: `${ORDER_PREFIX}-000106`, createdAt: "2026-09-05T10:00:00-03:00", customer: { name: "Florencia Medina", email: "flor.m@ejemplo.com", phone: "223 555-0106" }, userId: null, status: "DELIVERED", fulfillment: "PICKUP", paymentMethod: "CHECKOUT_PRO", promisedDate: "2026-09-07",
    lines: [{ id: "a", productSlug: "isolate-zero", variantId: "iz-vainilla-2lb", quantity: 1 }] },
  { code: `${ORDER_PREFIX}-000105`, createdAt: "2026-08-20T11:10:00-03:00", customer: { name: "Paula Castro", email: "paula.c@ejemplo.com", phone: "223 555-0105" }, userId: null, status: "DELIVERED", fulfillment: "PICKUP", paymentMethod: "CHECKOUT_PRO", promisedDate: "2026-08-21",
    lines: [{ id: "a", productSlug: "ionic-whey", variantId: "iw-vainilla-2lb", quantity: 1 }, { id: "b", productSlug: "multivitaminico", variantId: "mv-60", quantity: 1 }] },
  { code: `${ORDER_PREFIX}-000104`, createdAt: "2026-08-13T19:20:00-03:00", customer: { name: "Tomás Herrera", email: "tomas.h@ejemplo.com", phone: "223 555-0104" }, userId: null, status: "DELIVERED", fulfillment: "LOCAL_DELIVERY", paymentMethod: "CHECKOUT_PRO", address: "Jara 1450, Mar del Plata (7600)", promisedDate: "2026-08-14",
    lines: [{ id: "a", productSlug: "overvolt-pre", variantId: "ov-mango-300", quantity: 1 }, { id: "b", productSlug: "creatina-brava", variantId: "cb-sin-sabor-250", quantity: 1 }] },
  { code: `${ORDER_PREFIX}-000103`, createdAt: "2026-08-06T18:30:00-03:00", customer: { name: "Juan Ibarra", email: "juan.i@ejemplo.com", phone: "223 555-0103" }, userId: null, status: "DELIVERED", fulfillment: "LOCAL_DELIVERY", paymentMethod: "CHECKOUT_PRO", address: "Funes 2100, Mar del Plata (7600)", promisedDate: "2026-08-07",
    lines: [{ id: "a", productSlug: "ionic-whey", variantId: "iw-chocolate-2lb", quantity: 1 }] },
];

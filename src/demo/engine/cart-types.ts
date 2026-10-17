import type { GiftOccasion } from "../types";
import type { GiftOpening, OpenChoice } from "./gift-options";

/** El producto se compra para regalar (pedido de Ignacio, fuera de la especificación). */
export interface LineGift {
  to: string;
  from: string;
  /** Si es el email de una cuenta, el regalo le aparece ahí sin abrir el link. */
  toEmail?: string;
  message: string;
  occasion: GiftOccasion;
  /** Apertura (R3b): bolsa de boxeo (por defecto) o locker con combinación. */
  opening?: GiftOpening;
  /** Combinación del locker (4 dígitos; por defecto el día y mes del regalo). */
  lockerCode?: string;
  /** Diseño de la tarjeta que se manda por WhatsApp (engine/gift-options.ts). */
  cardDesign?: string;
  /** Sabor o tamaño abiertos para quien recibe; la línea lleva la variante de referencia del precio. */
  openChoice?: OpenChoice;
}

/** Gift card comprada en el carrito (R3b): monto en pesos enteros y para quién es. No es un producto del catálogo. */
export interface CartGiftCard {
  id: string;
  amount: number;
  gift: LineGift;
}

export interface CartLine {
  id: string;
  productSlug: string;
  variantId: string;
  quantity: number;
  gift?: LineGift;
  /** La línea viene de un pack (L3): el descuento del pack vale solo si el pack está completo. */
  packId?: string;
  /** Día del mes (1–28) en que se recibe cada mes: la compra del pack es una suscripción simulada. */
  monthlyDay?: number;
}

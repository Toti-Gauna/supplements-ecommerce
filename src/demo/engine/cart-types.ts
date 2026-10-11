import type { GiftOccasion } from "../types";

/** El producto se compra para regalar (pedido de Ignacio, fuera de la especificación). */
export interface LineGift {
  to: string;
  from: string;
  /** Si es el email de una cuenta, el regalo le aparece ahí sin abrir el link. */
  toEmail?: string;
  message: string;
  occasion: GiftOccasion;
}

export interface CartLine {
  id: string;
  productSlug: string;
  variantId: string;
  quantity: number;
  gift?: LineGift;
}

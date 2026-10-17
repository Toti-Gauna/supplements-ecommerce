import type { LineGift } from "@/demo/engine/cart-types";
import type { Pack, Product, Variant } from "@/demo/types";

/** Lo que se está regalando en el armador "Regalá energía" (además de la gift card, que no es un producto). */
export type GiftSubject =
  | { kind: "producto"; product: Product; variant: Variant; quantity: number }
  | { kind: "stack"; pack: Pack; names: string[] };

/** Lo que devuelve el armador al confirmar. Con producto, `variantId` es la variante que fija el precio. */
export type GiftResult =
  | { kind: "item"; gift: LineGift; variantId?: string }
  | { kind: "gift-card"; gift: LineGift; amount: number };

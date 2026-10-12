/**
 * Cartel de oferta del Estudio (8.3.27) y lugar de cada pote: partes del texto y dónde va cada cosa en cada formato,
 * sin tapar el producto ni el precio. Todo sale del cupón de la temática; acá no hay porcentajes ni códigos fijos.
 */

export interface OfferParts {
  /** Lo grande: "30%", "$3.000" o "Envío gratis". */
  value: string;
  /** "OFF" al lado del valor, o vacío si el beneficio no es un descuento. */
  unit: string;
}

/** Separa "30% OFF" en valor y "OFF" para darles jerarquía distinta. */
export function offerParts(label: string): OfferParts {
  const m = /^(.*\S)\s+OFF$/i.exec(label.trim());
  return m ? { value: m[1]!, unit: "OFF" } : { value: label.trim(), unit: "" };
}

export interface Rect { x: number; y: number; w: number; h: number }

export const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/** Margen al borde de la pieza (el cartel va girado y con sombra). */
export const BADGE_EDGE = 44;

/** Dónde se dibuja un pote: centro, piso (la base del pedestal) y lado del cuadro de la ilustración (400 × 400). */
export interface PotSpot { cx: number; floorY: number; size: number }

/** La caja del envase dentro del cuadro: el piso del dibujo está en y = 330/400 y el envase ocupa el centro. */
export function potRect({ cx, floorY, size }: PotSpot): Rect {
  return { x: cx - size * 0.3, y: floorY - size * 0.66, w: size * 0.6, h: size * 0.66 };
}

/**
 * Post 1:1: titular, texto y precio a la izquierda (x 80–530); el pote en su pedestal a la derecha. Con oferta, el
 * cartel va arriba a la derecha y el pote se achica lo necesario para quedar debajo (el cartel solo roza su tapa).
 */
export function postLayout(W: number, badge: { w: number; h: number } | null): { pot: PotSpot; badge: Rect | null } {
  const floorY = 830;
  if (!badge) return { pot: { cx: 790, floorY, size: 560 }, badge: null };
  const b = { x: W - BADGE_EDGE - badge.w, y: 52, w: badge.w, h: badge.h };
  const size = Math.round(Math.min(520, Math.max(380, (floorY - (b.y + b.h - 30)) / 0.66)));
  return { pot: { cx: 790, floorY, size }, badge: b };
}

/** Historia 9:16: el cartel va al costado derecho del pote, arriba, apoyado sobre su borde. */
export function storyBadge(W: number, pot: Rect, badge: { w: number; h: number }): Rect {
  const x = Math.min(W - BADGE_EDGE - badge.w, pot.x + pot.w - Math.min(40, badge.w * 0.12));
  return { x, y: pot.y - 60, w: badge.w, h: badge.h };
}

/** Cuánto del cartel cae sobre el pote o la tarjeta (0–1 de su área). */
export function coverRatio(card: Rect, badge: Rect): number {
  const w = Math.max(0, Math.min(card.x + card.w, badge.x + badge.w) - Math.max(card.x, badge.x));
  const h = Math.max(0, Math.min(card.y + card.h, badge.y + badge.h) - Math.max(card.y, badge.y));
  return (w * h) / (card.w * card.h);
}

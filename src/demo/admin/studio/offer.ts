/**
 * Cartel de oferta del Estudio (8.3.27): partes del texto y dónde va en cada formato, sin tapar el producto ni el
 * precio. Todo sale del cupón de la temática; acá no hay porcentajes ni códigos fijos.
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

/**
 * Post 1:1: con oferta, la tarjeta baja un poco y el cartel va arriba a la derecha, apoyado en el borde de la tarjeta
 * (solo pisa su margen superior, no el producto); la decoración de la temática se corre a su izquierda para que el
 * cartel no la tape. Sin oferta, todo queda donde estaba. `cast`: la temática tiene personajes (dos figuras, más anchas).
 */
export function postLayout(W: number, badge: { w: number; h: number } | null, cast = false) {
  if (!badge) return { card: { x: 560, y: 250, w: 430, h: 538 }, badge: null, hero: { x: W * 0.7, y: 54, size: 210 } };
  const b = { x: W - BADGE_EDGE - badge.w, y: 48, w: badge.w, h: badge.h };
  // La tarjeta baja lo necesario para que el cartel solo se apoye en su borde (≤ 48 px) y termina siempre en y = 800.
  const top = Math.min(380, Math.max(300, b.y + b.h - 48));
  const card = { x: 560, y: top, w: 430, h: 800 - top };
  const size = cast ? 150 : 180;
  // Los personajes ocupan de x − 0,3·size a x + 1,22·size; una decoración sola, de x a x + size.
  const x = cast ? b.x + 16 - 1.22 * size : Math.min(590, b.x + 16 - size);
  return { card, badge: b, hero: { x, y: 40, size } };
}

/** Historia 9:16: el cartel va al costado derecho de la tarjeta, arriba, apoyado sobre su borde. */
export function storyBadge(W: number, card: Rect, badge: { w: number; h: number }): Rect {
  const x = Math.min(W - BADGE_EDGE - badge.w, card.x + card.w - Math.min(80, badge.w * 0.28));
  return { x, y: card.y - 36, w: badge.w, h: badge.h };
}

/** Cuánto del cartel cae sobre la tarjeta (0–1 del área de la tarjeta). */
export function coverRatio(card: Rect, badge: Rect): number {
  const w = Math.max(0, Math.min(card.x + card.w, badge.x + badge.w) - Math.max(card.x, badge.x));
  const h = Math.max(0, Math.min(card.y + card.h, badge.y + badge.h) - Math.max(card.y, badge.y));
  return (w * h) / (card.w * card.h);
}

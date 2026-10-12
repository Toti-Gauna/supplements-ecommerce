import { DISPATCH_PROMISE } from "../engine/lead-time";
import type { Faq, Variant } from "../types";

export interface SizeSpec {
  /** Rótulo del tamaño ("2 lb (907 g)"). */
  size: string;
  /** Sufijo del id ("2lb"). */
  key: string;
  servings: number;
  /** Recargo sobre el precio base, en pesos. */
  delta: number;
}

const slugify = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/**
 * Variantes sabor × tamaño. `stock` recibe (sabor, tamaño) y devuelve las unidades (0 = sin stock).
 * Ids estables: `${prefijo}-${sabor}-${tamaño}`. Sin sabores (`null`: cápsulas, accesorios), una variante por tamaño.
 */
export function flavorGrid(prefix: string, flavors: [string, string][] | null, sizes: SizeSpec[], stock: (flavor: string, sizeKey: string) => number): Variant[] {
  if (!flavors) return sizes.map((s) => ({ id: `${prefix}-${s.key}`, label: s.size, size: s.size, servings: s.servings, priceDelta: s.delta, stock: stock("", s.key) }));
  return flavors.flatMap(([color, colorHex]) => sizes.map((s) => ({
    id: `${prefix}-${slugify(color)}-${s.key}`,
    label: sizes.length > 1 ? `${color} · ${s.size}` : color,
    color, colorHex, size: s.size, servings: s.servings, priceDelta: s.delta,
    stock: stock(color, s.key),
  })));
}

/** Preguntas que comparte todo el catálogo. */
export const FAQ = {
  original: { q: "¿Es original?", a: "Sí. Compramos directo a la marca o a su distribuidor oficial y cada envase tiene lote y vencimiento a la vista." } satisfies Faq,
  conservar: { q: "¿Cómo lo conservo?", a: "En un lugar fresco y seco, bien cerrado y lejos del sol. Usá siempre el scoop seco." } satisfies Faq,
  consulta: { q: "¿Lo puedo tomar si tengo una condición de salud?", a: "Los suplementos no reemplazan una alimentación variada. Si estás embarazada, amamantando, tomás medicación o tenés una condición de salud, consultá antes con tu médico." } satisfies Faq,
  cafeina: { q: "¿Tiene cafeína?", a: "Sí. No lo combines con otros productos con cafeína ni lo tomes de noche. No recomendado para menores de 18 años." } satisfies Faq,
  envio: { q: "¿Cuándo llega?", a: `En Mar del Plata, con cadete ${DISPATCH_PROMISE} (si ese día el reparto está completo, el próximo día hábil con lugar). Al resto del país, de 3 a 7 días hábiles.` } satisfies Faq,
};

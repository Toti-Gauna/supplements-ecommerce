/**
 * Qué se suele llevar junto con cada categoría (R4c, "Lote que vence = acción armada"): el complemento para el combo de
 * un lote por vencer, de la categoría más lógica a la menos. De MUESTRA: el dueño ajusta el combo antes de crearlo.
 */
export const COMPLEMENT_CATEGORIES: Record<string, string[]> = {
  proteinas: ["creatinas", "shakers", "snacks"],
  ganadores: ["creatinas", "shakers", "aminoacidos"],
  creatinas: ["proteinas", "shakers", "hidratacion"],
  "pre-entrenos": ["aminoacidos", "hidratacion", "shakers"],
  aminoacidos: ["pre-entrenos", "creatinas", "shakers"],
  definicion: ["proteinas", "salud", "shakers"],
  salud: ["proteinas", "hidratacion", "snacks"],
  snacks: ["shakers", "hidratacion", "proteinas"],
  hidratacion: ["snacks", "salud", "shakers"],
};

/** Si la categoría no está en la tabla. */
export const DEFAULT_COMPLEMENTS = ["shakers", "snacks", "hidratacion"];

/** Descuento propuesto por llevar el combo, y los que ofrece el panel. */
export const COMBO_PCT = 15;
export const COMBO_PCT_OPTIONS = [10, 15, 20] as const;

/** Cupón para quienes ya compraron el producto: % propuesto, opciones y días de vigencia (sin pasar del vencimiento). */
export const LOT_COUPON_PCT = 15;
export const LOT_COUPON_PCT_OPTIONS = [10, 15, 20, 25] as const;
export const LOT_COUPON_DAYS = 14;

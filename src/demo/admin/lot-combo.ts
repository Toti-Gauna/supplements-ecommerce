import { expiryState } from "../engine/lots";
import { COMBO_PCT, COMPLEMENT_CATEGORIES, DEFAULT_COMPLEMENTS } from "../fixtures/lot-combos";
import type { Pack, Product, Variant } from "../types";
import type { LotRow } from "./lots";
import { variantPrice } from "./stock";
import { landedCost, type CostBook } from "./supplier-list/costs";
import { marginPct } from "./workshop/costs";

/**
 * Combo de un lote por vencer (R4c): el producto del lote junto con el complemento más lógico, con un descuento por
 * llevarlos juntos. Se crea como un pack real de la tienda (Stock → Packs). Precios de lista, en pesos enteros.
 */
export interface ComboPlan {
  complement: { slug: string; name: string; variantId: string; variantLabel: string; price: number };
  /** Precio de los dos sueltos, descuento y precio del combo. */
  listTotal: number;
  pct: number;
  price: number;
  saving: number;
  /** Margen del combo sobre el costo de los dos (null si falta algún costo). */
  margin: number | null;
  pack: Pack;
}

export const comboId = (lotCode: string) => `combo-${lotCode.toLowerCase()}`;

const sellable = (p: Product, v: Variant, today: string) => v.stock !== 0 && (v.lots ?? []).every((l) => l.units <= 0 || expiryState(l.expires, today) === "ok");

/** El complemento: la primera categoría de la tabla con un producto activo y con stock sano; el más vendido de esa categoría. */
export function pickComplement(lot: Pick<LotRow, "productSlug">, products: Product[], today: string): { product: Product; variant: Variant } | null {
  const base = products.find((p) => p.slug === lot.productSlug);
  const order = (base && COMPLEMENT_CATEGORIES[base.categorySlug]) || DEFAULT_COMPLEMENTS;
  for (const category of order) {
    const options = products.filter((p) => p.categorySlug === category && p.active !== false && p.slug !== lot.productSlug)
      .flatMap((p) => { const v = p.variants.find((x) => sellable(p, x, today)); return v ? [{ product: p, variant: v }] : []; })
      .sort((a, b) => b.product.soldCount - a.product.soldCount || variantPrice(a.product, a.variant) - variantPrice(b.product, b.variant));
    if (options[0]) return options[0];
  }
  return null;
}

/** El combo propuesto para el lote, o null si no hay con qué armarlo. */
export function comboPlan(lot: LotRow, products: Product[], book: CostBook, today: string, pct = COMBO_PCT, pick = pickComplement(lot, products, today)): ComboPlan | null {
  const main = products.find((p) => p.slug === lot.productSlug);
  const mainVariant = main?.variants.find((v) => v.id === lot.variantId);
  if (!main || !mainVariant || !pick) return null;
  const { product: other, variant } = pick;
  const prices = [variantPrice(main, mainVariant), variantPrice(other, variant)];
  const listTotal = prices[0]! + prices[1]!;
  const saving = Math.round((listTotal * pct) / 100);
  const costs = [landedCost(main, mainVariant, book), landedCost(other, variant, book)];
  const price = listTotal - saving;
  return {
    complement: { slug: other.slug, name: other.name, variantId: variant.id, variantLabel: variant.label, price: prices[1]! },
    listTotal, pct, price, saving, margin: costs.every((c): c is number => c !== null) ? marginPct(price, costs[0]! + costs[1]!) : null,
    pack: {
      id: comboId(lot.lot.code), name: `Combo ${main.name} + ${other.name}`, tagline: "Combo por tiempo limitado",
      description: `${main.name} junto con ${other.name}, con ${pct} % menos por llevarlos juntos.`, focus: "Combo", featured: false, active: true, monthlyPct: 0, discountPct: pct,
      items: [{ productSlug: main.slug, variantId: lot.variantId, qty: 1 }, { productSlug: other.slug, variantId: variant.id, qty: 1 }],
    },
  };
}

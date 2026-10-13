import { unitPrice } from "@/demo/engine/catalog";
import { deliveryWindows, estimateForProduct } from "@/demo/engine/delivery";
import { bestValueSize, pricePerServing, servingSavingsPct } from "@/demo/engine/servings";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import type { Product } from "@/demo/types";
import { formatDay } from "@/lib/date";
import { adminSeed, productView, type ProductView } from "./data";

/** Primer número de un renglón del rótulo ("118 kcal = 496 kJ" → "118"), con su unidad. */
function nutrient(p: Product, label: string): { value: string; unit: string } | null {
  const row = p.nutrition?.rows.find((r) => r.label === label);
  const m = row?.serving.match(/^([\d.,]+)\s*([^\s=]*)/);
  return m ? { value: m[1]!, unit: m[2] ?? "" } : null;
}

export interface FlavorPlate { name: string; hex: string; stock: number; selected: boolean }
export interface SizePlate { size: string; servings: number | null; price: number; pps: number | null; best: boolean; selected: boolean }

export interface SheetView extends ProductView {
  protein: { value: string; unit: string } | null;
  kcal: { value: string; unit: string } | null;
  flavors: FlavorPlate[];
  sizes: SizePlate[];
  savingsPct: number | null;
  windows: { label: string; when: string }[];
}

const WINDOW_LABEL = { pickup: "Retiro en el local", local: "Cadete MdP", shipping: "Envío al país" } as const;

/** Primer pantallazo de la ficha: sabores (stock del tamaño elegido) y tamaños (precio por servicio de cada uno). */
export function sheetView(slug: string): SheetView {
  const view = productView(slug);
  const { product: p, variant } = view;
  const flavorNames = [...new Set(p.variants.map((v) => v.color).filter((c): c is string => !!c))];
  const flavors = flavorNames.map((name) => {
    const v = p.variants.find((x) => x.color === name && x.size === variant.size);
    return { name, hex: v?.colorHex ?? "#999", stock: v?.stock ?? 0, selected: name === variant.color };
  });
  const best = bestValueSize(p, variant.color);
  const sizes = [...new Set(p.variants.map((v) => v.size).filter((x): x is string => !!x))].map((size) => {
    const v = p.variants.find((x) => x.size === size && x.color === variant.color)!;
    const price = unitPrice(p, v);
    return { size, servings: v.servings ?? null, price, pps: pricePerServing(price, v.servings), best: size === best, selected: size === variant.size };
  });
  const est = estimateForProduct(p, variant, DEMO_TODAY, adminSeed.orders, adminSeed.workshop.settings);
  const windows = deliveryWindows(est.earliest, adminSeed.workshop.settings, est.day).map((w) => ({
    label: WINDOW_LABEL[w.id], when: w.from === w.to ? formatDay(w.from) : `${formatDay(w.from)} – ${formatDay(w.to)}`,
  }));
  return {
    ...view, flavors, sizes, windows,
    protein: nutrient(p, "Proteínas"), kcal: nutrient(p, "Valor energético"),
    savingsPct: servingSavingsPct(p, variant.color),
  };
}

import type { Product } from "../../types";
import { cellText, parseMoney, type Cell } from "../import/cells";
import { findProduct, pickVariants } from "../import/supplier";
import { detectSupplierMapping, findSupplierHeader } from "../import/supplier-columns";
import { marginPct } from "../workshop/costs";
import { variantPrice } from "../stock";
import { brandMargin, landedCost, packagingCost, supplierCostNow, type CostBook } from "./costs";
import { proposedPrice, type PriceEnding } from "./round";

/**
 * Vista de diferencias de la lista del proveedor (R4c): cada fila de la lista contra el costo que la tienda tiene
 * cargado, con el precio de venta nuevo que propone el margen de la marca. Nunca crea productos y no cambia nada
 * hasta aplicar. Puro y testeado; en producción lo calcula el servidor.
 */
export type DiffKind = "sube" | "baja" | "igual" | "nuevo" | "sin-coincidencia" | "error";

export interface VariantDiff {
  key: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  brand: string;
  /** Costo del proveedor antes y ahora (pesos enteros); antes puede no estar cargado. */
  oldCost: number | null;
  newCost: number;
  /** Variación del costo en % (con un decimal); null sin costo anterior. */
  pct: number | null;
  price: number;
  /** Margen que deja el precio actual con el costo de antes y con el costo nuevo. */
  marginBefore: number | null;
  marginAfter: number;
  /** Margen buscado de la marca y precio que lo recupera. */
  target: number;
  proposed: number;
}

export interface DiffLine {
  line: number;
  label: string;
  kind: DiffKind;
  /** Por qué no coincide o qué está mal (solo "sin-coincidencia" y "error"). */
  reason?: string;
  variants: VariantDiff[];
}

export type DiffCounts = Record<DiffKind, number>;
export interface SupplierDiff { lines: DiffLine[]; variants: VariantDiff[]; counts: DiffCounts; summary: string }

const WORDS: Record<DiffKind, [string, string]> = {
  sube: ["sube", "suben"], baja: ["baja", "bajan"], igual: ["sin cambio", "sin cambios"], nuevo: ["costo nuevo", "costos nuevos"],
  "sin-coincidencia": ["sin coincidencia", "sin coincidencia"], error: ["con error", "con error"],
};
const ORDER: DiffKind[] = ["sube", "baja", "igual", "nuevo", "sin-coincidencia", "error"];

/** "48 suben, 3 bajan, 2 sin coincidencia": solo lo que hay. */
export function summaryOf(counts: DiffCounts): string {
  return ORDER.filter((k) => counts[k] > 0).map((k) => `${counts[k]} ${WORDS[k][counts[k] === 1 ? 0 : 1]}`).join(", ") || "La lista no trae filas";
}

export interface DiffContext { products: Product[]; book: CostBook; ending: PriceEnding }

const kindOf = (variants: VariantDiff[]): DiffKind => {
  if (variants.every((v) => v.oldCost === null)) return "nuevo";
  const delta = variants.reduce((s, v) => s + (v.oldCost === null ? 0 : v.newCost - v.oldCost), 0);
  return delta > 0 ? "sube" : delta < 0 ? "baja" : "igual";
};

export function diffSupplierList(rows: Cell[][], ctx: DiffContext): SupplierDiff | { error: string } {
  const headerAt = findSupplierHeader(rows);
  const m = detectSupplierMapping(rows[headerAt] ?? []);
  if (m.product === null || m.cost === null) return { error: "No encontramos las columnas de producto y costo. Revisá que la primera fila tenga títulos como “Artículo” y “Costo”." };
  const at = (cells: Cell[], i: number | null) => (i === null ? "" : cellText(cells[i]));
  const lines: DiffLine[] = [];
  rows.slice(headerAt + 1).forEach((cells, i) => {
    if (!cells.some((c) => cellText(c) !== "")) return;
    const r = { brand: at(cells, m.brand), product: at(cells, m.product), size: at(cells, m.size), flavor: at(cells, m.flavor), variant: at(cells, m.variant) };
    const label = [r.product, r.size, r.flavor || r.variant].filter(Boolean).join(" · ");
    const line: DiffLine = { line: headerAt + i + 2, label: r.brand ? `${r.brand} · ${label}` : label, kind: "sin-coincidencia", variants: [] };
    lines.push(line);
    const cost = parseMoney(cells[m.cost!]);
    if (!cost.ok) { line.kind = "error"; line.reason = cost.error; return; }
    const product = r.product ? findProduct(ctx.products, r.product, r.brand) : undefined;
    if (!product) { line.reason = "No lo vendés"; return; }
    const picked = pickVariants(product, r);
    if (!picked.ok) { line.reason = picked.error; return; }
    const target = brandMargin(product.brand, ctx.book.settings);
    const pack = packagingCost(ctx.book.recipes[product.slug], ctx.book.materials);
    line.variants = picked.value.map((v) => {
      const oldCost = supplierCostNow(product, v, ctx.book);
      const price = variantPrice(product, v);
      const before = landedCost(product, v, ctx.book, oldCost);
      return {
        key: `${product.slug}::${v.id}`, productSlug: product.slug, productName: product.name, variantId: v.id, variantLabel: v.label, brand: product.brand,
        oldCost, newCost: cost.value, pct: oldCost ? Math.round(((cost.value - oldCost) / oldCost) * 1000) / 10 : null,
        price, marginBefore: before === null ? null : marginPct(price, before), marginAfter: marginPct(price, cost.value + pack) ?? 0,
        target, proposed: proposedPrice(cost.value + pack, target, ctx.ending),
      };
    });
    line.kind = kindOf(line.variants);
  });
  const counts = Object.fromEntries(ORDER.map((k) => [k, lines.filter((l) => l.kind === k).length])) as DiffCounts;
  const seen = new Map<string, VariantDiff>();
  for (const v of lines.flatMap((l) => l.variants)) seen.set(v.key, v);
  return { lines, variants: [...seen.values()], counts, summary: summaryOf(counts) };
}

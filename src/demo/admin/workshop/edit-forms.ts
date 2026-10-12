import type { Material, MaterialUnit, Recipe } from "../../fixtures/workshop";
import { parseMoney } from "../import/cells";
import { parseQty } from "../sheet-specs";
import { usesDecimals } from "./materials";

/**
 * Borradores de los modales de Costos e Insumos (8.3.17): se editan como texto, se validan acá y se guardan de una
 * vez. Errores legibles para mostrar al lado de cada campo; sin errores, el valor listo para el engine.
 */
const show = (n: number) => String(n).replace(".", ",");

export interface MaterialDraft { name: string; unit: MaterialUnit; cost: string; min: string; supplier: string }
export type MaterialField = "name" | "cost" | "min";

export function materialDraft(m?: Material): MaterialDraft {
  return { name: m?.name ?? "", unit: m?.unit ?? "u", cost: m ? String(m.costPerUnit) : "", min: m ? show(m.minStock) : "", supplier: m?.supplier ?? "" };
}

export function checkMaterial(d: MaterialDraft): { errors: Partial<Record<MaterialField, string>>; value?: Omit<Material, "id" | "stock"> } {
  const errors: Partial<Record<MaterialField, string>> = {};
  if (!d.name.trim()) errors.name = "Escribí el nombre del insumo.";
  const cost = parseMoney(d.cost);
  if (!cost.ok) errors.cost = cost.error.replace("precio", "costo");
  const min = parseQty(d.min, usesDecimals(d.unit));
  if (!min.ok) errors.min = min.error;
  if (Object.keys(errors).length || !cost.ok || !min.ok) return { errors };
  return { errors, value: { name: d.name.trim(), unit: d.unit, costPerUnit: cost.value, minStock: min.value, supplier: d.supplier.trim() || undefined } };
}

/**
 * `supplier`: costo al proveedor de la presentación más barata ("" = sin cargar); `variants`: costo propio de otras
 * presentaciones (id → texto; "" = se estima en proporción al precio).
 */
export interface RecipeDraft { supplier: string; variants: Record<string, string>; items: { materialId: string; qty: string }[] }

export function recipeDraft(r: Recipe): RecipeDraft {
  return {
    supplier: r.supplierCost !== undefined ? String(r.supplierCost) : "",
    variants: Object.fromEntries(Object.entries(r.variantCosts ?? {}).map(([id, cost]) => [id, String(cost)])),
    items: r.items.map((i) => ({ materialId: i.materialId, qty: show(i.qty) })),
  };
}

/** Costos de proveedor en pesos enteros (o vacíos) y cantidades de embalaje mayores que 0 (con coma decimal). */
export function checkRecipe(d: RecipeDraft): { errors: Record<string, string>; value?: Recipe } {
  const errors: Record<string, string> = {};
  const supplierText = d.supplier.trim();
  const supplier = supplierText ? parseMoney(supplierText) : null;
  if (supplier && !supplier.ok) errors.supplier = supplier.error;
  const variantCosts: Record<string, number> = {};
  for (const [id, text] of Object.entries(d.variants)) {
    if (!text.trim()) continue;
    const cost = parseMoney(text);
    if (cost.ok) variantCosts[id] = cost.value;
    else errors[`variant:${id}`] = cost.error;
  }
  const items = d.items.map((i) => {
    const q = parseQty(i.qty, true);
    if (!q.ok) errors[`item:${i.materialId}`] = q.error;
    else if (q.value <= 0) errors[`item:${i.materialId}`] = "Tiene que ser mayor que 0 (o quitá el insumo).";
    return { materialId: i.materialId, qty: q.ok ? q.value : 0 };
  });
  if (Object.keys(errors).length) return { errors };
  const supplierCost = supplier?.ok ? supplier.value : undefined;
  return { errors, value: { ...(supplierCost !== undefined ? { supplierCost } : {}), ...(Object.keys(variantCosts).length ? { variantCosts } : {}), items } };
}

/** Precio de prueba: pesos enteros mayores que 0. */
export function checkTrialPrice(text: string): { ok: true; value: number } | { ok: false; error: string } {
  const p = parseMoney(text);
  if (!p.ok) return p;
  return p.value > 0 ? p : { ok: false, error: "El precio tiene que ser mayor que 0." };
}

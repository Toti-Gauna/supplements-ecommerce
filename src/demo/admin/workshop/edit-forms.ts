import type { Material, MaterialUnit, Recipe } from "../../fixtures/workshop";
import { parseMoney } from "../import/cells";
import { parseQty } from "../sheet-specs";

/**
 * Borradores de los modales de Costos e Insumos (8.3.17): se editan como texto, se validan acá y se guardan de una
 * vez. Errores legibles para mostrar al lado de cada campo; sin errores, el valor listo para el engine.
 */
const decimalUnit = (u: MaterialUnit) => u === "m" || u === "plancha";
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
  const min = parseQty(d.min, decimalUnit(d.unit));
  if (!min.ok) errors.min = min.error;
  if (Object.keys(errors).length || !cost.ok || !min.ok) return { errors };
  return { errors, value: { name: d.name.trim(), unit: d.unit, costPerUnit: cost.value, minStock: min.value, supplier: d.supplier.trim() || undefined } };
}

export interface RecipeDraft { items: { materialId: string; qty: string }[]; machine: string; hand: string }

export function recipeDraft(r: Recipe): RecipeDraft {
  return { items: r.items.map((i) => ({ materialId: i.materialId, qty: show(i.qty) })), machine: String(r.machineMinutes), hand: String(r.handMinutes) };
}

const minutes = (t: string): number | null => (/^\d+$/.test(t.trim()) ? Number(t.trim()) : null);

/** Cantidades mayores que 0 (con coma decimal) y minutos enteros de 0 en adelante. */
export function checkRecipe(d: RecipeDraft): { errors: Record<string, string>; value?: Recipe } {
  const errors: Record<string, string> = {};
  const items = d.items.map((i) => {
    const q = parseQty(i.qty, true);
    if (!q.ok) errors[`item:${i.materialId}`] = q.error;
    else if (q.value <= 0) errors[`item:${i.materialId}`] = "Tiene que ser mayor que 0 (o quitá el insumo).";
    return { materialId: i.materialId, qty: q.ok ? q.value : 0 };
  });
  const machine = minutes(d.machine);
  const hand = minutes(d.hand);
  if (machine === null) errors.machine = "Minutos enteros, 0 o más.";
  if (hand === null) errors.hand = "Minutos enteros, 0 o más.";
  if (Object.keys(errors).length) return { errors };
  return { errors, value: { items, machineMinutes: machine!, handMinutes: hand! } };
}

/** Precio de prueba: pesos enteros mayores que 0. */
export function checkTrialPrice(text: string): { ok: true; value: number } | { ok: false; error: string } {
  const p = parseMoney(text);
  if (!p.ok) return p;
  return p.value > 0 ? p : { ok: false, error: "El precio tiene que ser mayor que 0." };
}

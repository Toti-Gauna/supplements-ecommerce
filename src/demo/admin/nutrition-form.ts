import type { Nutrition, NutritionRow, Usage } from "../types";

/**
 * Rótulo y modo de uso editables en el panel (R2): lo que antes "venía con la ficha del proveedor". Puro y testeado;
 * la tienda lee lo que se guarda (la ficha, el marcador por servicio y "Cómo tomarlo").
 */

/** Renglones obligatorios del rótulo argentino, vacíos, para empezar una tabla nueva. */
const BASE_ROWS: NutritionRow[] = [
  { label: "Valor energético", serving: "" },
  { label: "Carbohidratos", serving: "" },
  { label: "Proteínas", serving: "" },
  { label: "Grasas totales", serving: "" },
  { label: "Grasas saturadas", serving: "", sub: true },
  { label: "Grasas trans", serving: "", sub: true },
  { label: "Fibra alimentaria", serving: "" },
  { label: "Sodio", serving: "" },
];

export function blankNutrition(): Nutrition {
  return { serving: "", rows: BASE_ROWS.map((r) => ({ ...r })), ingredients: "" };
}

export function blankUsage(): Usage {
  return { moments: [], text: "" };
}

/** Cambia un renglón; los campos vacíos opcionales (100 g, %VD) se quitan para no dejar columnas con "". */
export function patchRow(n: Nutrition, index: number, patch: Partial<NutritionRow>): Nutrition {
  return {
    ...n,
    rows: n.rows.map((r, i) => {
      if (i !== index) return r;
      const next: NutritionRow = { ...r, ...patch };
      if (!next.per100?.trim()) delete next.per100;
      if (!next.dv?.trim()) delete next.dv;
      if (!next.sub) delete next.sub;
      return next;
    }),
  };
}

export function addRow(n: Nutrition): Nutrition {
  return { ...n, rows: [...n.rows, { label: "", serving: "" }] };
}

export function removeRow(n: Nutrition, index: number): Nutrition {
  return { ...n, rows: n.rows.filter((_, i) => i !== index) };
}

/** Al guardar: renglones sin nombre ni valor afuera; una tabla que quedó vacía se borra del producto. */
export function cleanNutrition(n: Nutrition | undefined): Nutrition | undefined {
  if (!n) return undefined;
  const rows = n.rows.filter((r) => r.label.trim() && r.serving.trim());
  if (rows.length === 0 && !n.ingredients.trim()) return undefined;
  const out: Nutrition = { ...n, rows };
  if (!out.allergens?.trim()) delete out.allergens;
  if (!out.note?.trim()) delete out.note;
  return out;
}

/** Un modo de uso sin texto ni momentos no se guarda (la ficha no muestra "Cómo tomarlo" vacío). */
export function cleanUsage(u: Usage | undefined): Usage | undefined {
  if (!u || (!u.text.trim() && u.moments.length === 0)) return undefined;
  const out: Usage = { ...u, text: u.text.trim() };
  if (!out.dose?.trim()) delete out.dose;
  return out;
}

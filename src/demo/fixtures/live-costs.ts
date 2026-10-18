/**
 * Desde cuándo rige el costo cargado de cada producto (R4c, "Costos vivos"). De MUESTRA: las fechas son inventadas.
 * Un costo que se actualiza desde la lista del proveedor o desde Costos y margen toma la fecha del día en que se cambió.
 */
export const DEFAULT_COST_SINCE = "2026-08-17";

export const COST_DATES: Record<string, string> = {
  "ionic-whey": "2026-09-14", "creatina-monohidrato": "2026-09-14", "creatina-gomitas": "2026-09-14", glutamina: "2026-09-14",
  multivitaminico: "2026-09-14", "barra-proteica": "2026-09-14", electrolitos: "2026-09-14", "shaker-volta": "2026-09-14", "magnesio-tiza": "2026-09-14",
  "isolate-zero": "2026-07-20", "bcaa-211": "2026-07-20", "l-carnitina": "2026-07-20", colageno: "2026-07-20",
  "proteina-vegana": "2026-08-03", "omega-3": "2026-08-03", "magnesio-bisglicinato": "2026-08-03", "mantequilla-mani": "2026-08-03",
  "night-casein": "2026-06-29", "creatina-brava": "2026-06-29", "pump-flow": "2026-06-29", "alfajor-proteico": "2026-06-29",
  "mass-gainer": "2026-08-17", "overvolt-pre": "2026-08-17", "termo-cut": "2026-08-17", "gel-energetico": "2026-08-17",
};

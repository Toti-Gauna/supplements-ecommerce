import { formatARS } from "@/lib/money";
import type { Product } from "../types";
import type { SheetScore } from "./sheet";

/**
 * La tira chica debajo del precio total de la ficha (L1, pedido de Ignacio: primero el total y abajo, en chico, cuánto
 * rinde). Suplementos: lo que rinde la presentación. Equipamiento: sus datos de ficha (colores, talles, medidas).
 * Puro y testeado; en producción, src/server/services.
 */
export interface Readout {
  key: "per-serving" | "active" | "servings" | "days" | "colors" | "sizes" | "dims" | "weight";
  label: string;
  /** Lo que se muestra: cifra para el marcador ("24", "3.000") o, con `text`, un dato en mono ("10 a 16 oz"). */
  value: string;
  /** En pesos: el marcador le pone el signo. */
  amount?: number;
  /** No es una cifra para el marcador LED. */
  text?: boolean;
  unit?: string;
  /** Lectura completa para lectores de pantalla. */
  reading: string;
}

/** Suplementos: precio por servicio, el activo por servicio, servicios y "te dura N días" (lo que aplique). */
export function scoreReadouts(s: SheetScore, perDay = 1): Readout[] {
  const out: Readout[] = [];
  if (s.perServing !== null) out.push({ key: "per-serving", label: "Por servicio", value: String(s.perServing), amount: s.perServing, reading: `${formatARS(s.perServing)} por servicio` });
  if (s.active) {
    const { label, amount, unit } = s.active;
    out.push({ key: "active", label, value: amount, unit, reading: `${amount} ${unit} de ${label.toLowerCase()} por servicio` });
  }
  if (s.servings) out.push({ key: "servings", label: "Servicios", value: String(s.servings), reading: `${s.servings} servicios` });
  if (s.days) out.push({ key: "days", label: "Te dura", value: String(s.days), unit: "días", reading: `Te dura ${s.days} días con ${perDay} servicio${perDay === 1 ? "" : "s"} por día` });
  return out;
}

const grams = (g: number) => (g >= 1000 ? `${(g / 1000).toLocaleString("es-AR", { maximumFractionDigits: 1 })} kg` : `${g} g`);

/** "10 oz" y "16 oz" → "10–16 oz"; talles sin unidad común → "S a XL". */
function sizeRange(first: string, last: string): string {
  const a = first.match(/^([\d.,]+)\s*(\D+)$/);
  const b = last.match(/^([\d.,]+)\s*(\D+)$/);
  return a && b && a[2] === b[2] ? `${a[1]}–${b[1]} ${a[2]}` : `${first} a ${last}`;
}

/**
 * Equipamiento: cuántos colores, de qué talle (o peso) a cuál, medidas y peso. Con menos de dos datos no hay tira (un
 * dato solo ya lo dicen las placas).
 */
export function gearReadouts(product: Product): Readout[] {
  const out: Readout[] = [];
  const colors = [...new Set(product.variants.map((v) => v.color).filter(Boolean))];
  const sizes = [...new Set(product.variants.map((v) => v.size).filter((x): x is string => !!x))];
  if (colors.length > 1) out.push({ key: "colors", label: "Colores", value: String(colors.length), reading: `${colors.length} colores` });
  if (sizes.length > 0) {
    const label = product.optionNames?.size ?? "Talle";
    const value = sizes.length > 1 ? sizeRange(sizes[0]!, sizes.at(-1)!) : sizes[0]!;
    out.push({ key: "sizes", label, value, text: true, reading: `${label}: ${value}` });
  }
  const d = product.dims;
  if (d && d.lengthCm > 0) out.push({ key: "dims", label: "Medidas", value: `${d.lengthCm}×${d.widthCm}×${d.heightCm} cm`, text: true, reading: `Medidas: ${d.lengthCm} por ${d.widthCm} por ${d.heightCm} cm` });
  if (d && d.weightG > 0) out.push({ key: "weight", label: "Peso neto", value: grams(d.weightG), text: true, reading: `Peso neto: ${grams(d.weightG)}` });
  return out.length > 1 ? out : [];
}

import { normalize } from "../../engine/search";

/** Lectura de celdas de una planilla: montos en pesos enteros, stock, sí/no y CSV. Puro y testeado. */
export type Cell = string | number | boolean | Date | null | undefined;

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

export function cellText(c: Cell): string {
  if (c === null || c === undefined) return "";
  if (c instanceof Date) return c.toISOString().slice(0, 10);
  return String(c).trim();
}

/** "$ 12.500", "12500", 12500 → 12500. Rechaza centavos: la tienda trabaja en pesos enteros. */
export function parseMoney(c: Cell): Parsed<number> {
  if (typeof c === "number") return Number.isInteger(c) && c >= 0 ? { ok: true, value: c } : { ok: false, error: "El precio tiene que ser en pesos enteros, sin centavos" };
  const raw = cellText(c).replace(/\$|ars|\s/gi, "").replace(/[.,]00$/, "");
  if (!raw) return { ok: false, error: "Falta el precio" };
  if (raw.startsWith("-")) return { ok: false, error: "El precio no puede ser negativo" };
  if (/[.,]\d{1,2}$/.test(raw) && !/^\d{1,3}([.,]\d{3})+$/.test(raw)) return { ok: false, error: "El precio tiene que ser en pesos enteros, sin centavos" };
  const digits = raw.replace(/[.,]/g, "");
  if (!/^\d+$/.test(digits)) return { ok: false, error: `“${cellText(c)}” no es un precio válido` };
  return { ok: true, value: Number(digits) };
}

const MADE_TO_ORDER = new Set(["a pedido", "apedido", "sin limite", "ilimitado"]);

/** Stock: entero ≥ 0, o "a pedido" (-1). Vacío = null (sin cambios). */
export function parseStock(c: Cell): Parsed<number | null> {
  if (typeof c === "number") {
    if (c === -1) return { ok: true, value: -1 };
    return Number.isInteger(c) && c >= 0 ? { ok: true, value: c } : { ok: false, error: "El stock tiene que ser un número entero, 0 o más" };
  }
  const text = cellText(c);
  if (text === "-1" || text === "∞") return { ok: true, value: -1 };
  if (text.startsWith("-")) return { ok: false, error: "El stock no puede ser negativo (usá “a pedido” si no tiene límite)" };
  const raw = normalize(text);
  if (!raw) return { ok: true, value: null };
  if (MADE_TO_ORDER.has(raw)) return { ok: true, value: -1 };
  const compact = text.replace(/\s/g, "");
  if (/^\d+$|^\d{1,3}(\.\d{3})+$/.test(compact)) return { ok: true, value: Number(compact.replace(/\./g, "")) };
  return { ok: false, error: `“${cellText(c)}” no es un stock válido (usá un número o “a pedido”)` };
}

/** Sí/no en criollo. Vacío = null (sin cambios). */
export function parseYesNo(c: Cell): Parsed<boolean | null> {
  if (typeof c === "boolean") return { ok: true, value: c };
  const raw = normalize(cellText(c));
  if (!raw) return { ok: true, value: null };
  if (["si", "s", "true", "1", "x", "visible", "activo", "yes"].includes(raw)) return { ok: true, value: true };
  if (["no", "n", "false", "0", "pausado", "oculto", "inactivo"].includes(raw)) return { ok: true, value: false };
  return { ok: false, error: `“${cellText(c)}” no es sí o no` };
}

export function slugify(text: string): string {
  return normalize(text).replace(/ñ/g, "n").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "") || "item";
}

/** CSV con comillas (RFC 4180). Detecta ";" (Excel en español) o ",". Ignora el BOM y las filas vacías. */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const firstLine = src.split(/\r?\n/, 1)[0] ?? "";
  const sep = (firstLine.match(/;/g)?.length ?? 0) >= (firstLine.match(/,/g)?.length ?? 0) && firstLine.includes(";") ? ";" : firstLine.includes("\t") && !firstLine.includes(",") ? "\t" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]!;
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"' && cell === "") quoted = true;
    else if (ch === sep) { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

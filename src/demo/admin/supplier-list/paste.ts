import { parseCsv, type Cell } from "../import/cells";

/**
 * Lo que se pega en la caja de texto → filas de celdas. Al copiar de Excel o Google Sheets las columnas vienen
 * separadas por tabulación (aunque el membrete de arriba no tenga ninguna); un CSV usa ; o , (ver `parseCsv`).
 */
export function parsePastedList(text: string): Cell[][] {
  const clean = text.replace(/^﻿/, "");
  if (clean.includes("\t")) return clean.split(/\r?\n/).filter((l) => l.trim() !== "").map((l) => l.split("\t").map((c) => c.trim()));
  return parseCsv(clean);
}

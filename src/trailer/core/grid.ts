import type { Ratio } from "./types";

/**
 * Grilla suiza de la pieza T1 (docs/trailer/t1/storyboard.md §5), pura y con tests. En 16:9: 12 columnas de 122 px y
 * 6 filas de 140 px con calles de 24 y márgenes de 96 (lados) y 60 (arriba y abajo). En 9:16: 6 columnas de 140 y 12 filas.
 */
export interface GridSpec { cols: number; colW: number; rows: number; rowH: number; gutter: number; marginX: number; marginY: number }

export const GRID: Record<Ratio, GridSpec> = {
  "16x9": { cols: 12, colW: 122, rows: 6, rowH: 140, gutter: 24, marginX: 96, marginY: 60 },
  "9x16": { cols: 6, colW: 140, rows: 12, rowH: 128, gutter: 24, marginX: 60, marginY: 60 },
};

/** x donde empieza la columna `k` (desde 1). */
export const colX = (ratio: Ratio, k: number) => GRID[ratio].marginX + (k - 1) * (GRID[ratio].colW + GRID[ratio].gutter);
/** y donde empieza la fila `r` (desde 1). */
export const rowY = (ratio: Ratio, r: number) => GRID[ratio].marginY + (r - 1) * (GRID[ratio].rowH + GRID[ratio].gutter);
/** x donde termina la columna `k` (desde 1). */
export const colEnd = (ratio: Ratio, k: number) => colX(ratio, k) + GRID[ratio].colW;

/** Líneas de la grilla (los bordes de cada columna y de cada fila) para dibujarlas una sola vez. */
export function gridLines(ratio: Ratio): { xs: number[]; ys: number[] } {
  const g = GRID[ratio];
  const xs = Array.from({ length: g.cols }, (_, i) => [colX(ratio, i + 1), colEnd(ratio, i + 1)]).flat();
  const ys = Array.from({ length: g.rows }, (_, i) => [rowY(ratio, i + 1), rowY(ratio, i + 1) + g.rowH]).flat();
  return { xs, ys };
}

/** Número entre 0 y 1 que sale solo del índice: las "fotocopias" salen siempre iguales (nada de azar en el trailer). */
export const hash01 = (i: number, salt = 0) => {
  let a = (Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(salt + 7, 0x85ebca6b)) >>> 0;
  a = Math.imul(a ^ (a >>> 15), 0x2c1b3c6d) >>> 0;
  a = Math.imul(a ^ (a >>> 12), 0x297a2d39) >>> 0;
  return ((a ^ (a >>> 15)) >>> 0) / 4294967296;
};

/** Marco 4:3 donde la línea se abre y vive la pantalla de carga de la pieza T1 (en 9:16 va arriba, a 960 × 720). */
export const FRAME: Record<Ratio, { x: number; y: number; w: number; h: number }> = {
  "16x9": { x: 680, y: 111, w: 1144, h: 858 },
  "9x16": { x: 60, y: 150, w: 960, h: 720 },
};
/** Alto de la línea plana: el centro del marco, así la línea se abre justo en él. */
export const lineY = (ratio: Ratio) => FRAME[ratio].y + FRAME[ratio].h / 2;

/** Eje de la promesa (T1, escenas 16 y 17): una línea volt a lo ancho, debajo del texto, que la cta pasa a corona y apaga. */
export const AXIS_Y: Record<Ratio, number> = { "16x9": 860, "9x16": 1500 };

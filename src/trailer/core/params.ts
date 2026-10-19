import type { Ratio } from "./types";

export interface TrailerParams {
  /** Segundo congelado (`?t=12.5`): el trailer no corre y queda en ese cuadro. */
  t: number | null;
  ratio: Ratio;
  /** Modo exportación (`?export=1`): sin controles ni puerta, expone `window.__trailer` para grabar cuadro a cuadro. */
  exportMode: boolean;
  /** Muestra el nombre de la escena y el tiempo (`?dev=1`). */
  dev: boolean;
  /** Fuerza el movimiento reducido (`?reduced=1`); el navegador también lo pide con `prefers-reduced-motion`. */
  reduced: boolean;
}

/** Lee la URL del trailer. Valores inválidos caen en el valor por defecto; `t` se recorta a [0, duración]. */
/** `portrait`: en un celular (pantalla angosta y vertical) abre en 9:16 salvo que la URL pida otro formato. */
export function parseParams(search: string, duration: number, portrait = false): TrailerParams {
  const q = new URLSearchParams(search);
  const raw = q.get("t");
  const n = raw === null || raw.trim() === "" ? NaN : Number(raw);
  return {
    t: Number.isFinite(n) ? Math.min(Math.max(n, 0), duration) : null,
    ratio: q.get("ratio") === "9x16" || (portrait && q.get("ratio") !== "16x9") ? "9x16" : "16x9",
    exportMode: q.get("export") === "1",
    dev: q.get("dev") === "1",
    reduced: q.get("reduced") === "1",
  };
}

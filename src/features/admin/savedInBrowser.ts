import type { DemoData } from "@/demo/engine/source";
import { STORAGE_PREFIX } from "@/stores/storage";

/**
 * ¿Lo que se acaba de guardar llegó al navegador? Si el almacenamiento está lleno, la demo lo tiene solo en memoria
 * (se perdería al recargar): el editor avisa y conserva el borrador. Sin almacenamiento (modo privado) la demo vive en
 * memoria a propósito, así que cuenta como guardado.
 */
export function savedInBrowser<T>(pick: (data: DemoData) => T, expected: T): boolean {
  let raw: string | null;
  try { raw = window.localStorage.getItem(`${STORAGE_PREFIX}admin`); } catch { return true; }
  try {
    const data = (JSON.parse(raw ?? "null") as { state?: { data?: DemoData } } | null)?.state?.data;
    return !!data && JSON.stringify(pick(data)) === JSON.stringify(expected);
  } catch { return false; }
}

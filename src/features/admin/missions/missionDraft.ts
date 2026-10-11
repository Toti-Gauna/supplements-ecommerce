"use client";
import type { Mission } from "@/demo/types";

/**
 * Borrador del modal de misión (8.3.23): cerrar o cancelar no guarda, pero el borrador queda en la pestaña y vuelve al
 * reabrir; guardar con éxito lo borra. Uno para "Nueva misión" y uno por misión editada.
 */
const key = (id: string) => `volta-ui:mission-draft:${id}`;
export const NEW_DRAFT = "nueva";

export function loadMissionDraft(id: string): Mission | null {
  try {
    const raw = sessionStorage.getItem(key(id));
    const m = raw ? (JSON.parse(raw) as Partial<Mission>) : null;
    return m && typeof m.id === "string" && typeof m.title === "string" && typeof m.reward === "string" && typeof m.threshold === "number" ? (m as Mission) : null;
  } catch { return null; }
}

export function saveMissionDraft(id: string, m: Mission) {
  try { sessionStorage.setItem(key(id), JSON.stringify(m)); } catch { /* sin almacenamiento: el borrador vive mientras el modal está abierto */ }
}

export function clearMissionDraft(id: string) {
  try { sessionStorage.removeItem(key(id)); } catch { /* nada que borrar */ }
}

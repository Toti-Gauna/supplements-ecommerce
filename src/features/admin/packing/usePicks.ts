"use client";
import { useSessionDraft } from "../useSessionDraft";

const NONE: string[] = [];
const isList = (x: unknown): x is string[] => Array.isArray(x) && x.every((v) => typeof v === "string");

/**
 * Paso 1 de Para armar: qué productos de un pedido ya se juntaron. Vive en la pestaña (salir y volver no lo pierde) y
 * se borra al pasar al paso 2 o al reiniciar la demo. No cambia el pedido: eso pasa al tocar "Ya junté todo".
 */
export function usePicks(code: string) {
  const session = useSessionDraft<string[]>(`volta-ui:pick-draft:${code}`, NONE, isList);
  const picked = new Set(session.draft);
  return {
    picked,
    toggle: (id: string, on: boolean) => session.setDraft((prev) => (on ? [...new Set([...prev, id])] : prev.filter((x) => x !== id))),
    clear: () => session.reset(),
  };
}

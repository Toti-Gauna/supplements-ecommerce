"use client";
import { useCallback, useSyncExternalStore } from "react";

export const ACCOUNT_TABS = ["mi-box", "pedidos", "suscripciones", "regalos", "misiones", "premios", "direcciones"] as const;
/** Hashes viejos que siguen abriendo su sección (los avisos de la ficha llevan a `#recompras`). */
const ALIASES: Record<string, AccountTab> = { recompras: "mi-box" };
export type AccountTab = (typeof ACCOUNT_TABS)[number];

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("hashchange", cb);
  return () => { listeners.delete(cb); window.removeEventListener("hashchange", cb); };
}
function read(): AccountTab {
  const h = decodeURIComponent(window.location.hash.slice(1));
  if (ALIASES[h]) return ALIASES[h];
  return (ACCOUNT_TABS as readonly string[]).includes(h) ? (h as AccountTab) : "mi-box";
}

/**
 * Sección abierta de Mi cuenta, guardada en el hash (`/cuenta/#regalos`): los links desde otras pantallas abren
 * directo la que corresponde. Elegir otra reemplaza el hash sin sumar entradas al historial ni mover la página.
 */
export function useAccountTab() {
  const tab = useSyncExternalStore(subscribe, read, () => "mi-box" as const);
  const select = useCallback((next: AccountTab) => {
    // Se conserva el estado del router de Next en el historial; solo cambia el fragmento.
    window.history.replaceState(window.history.state, "", `#${next}`);
    listeners.forEach((l) => l());
  }, []);
  return [tab, select] as const;
}

"use client";
import { useCallback, useSyncExternalStore } from "react";

export const ACCOUNT_TABS = ["pedidos", "regalos", "misiones", "premios", "direcciones"] as const;
export type AccountTab = (typeof ACCOUNT_TABS)[number];

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("hashchange", cb);
  return () => { listeners.delete(cb); window.removeEventListener("hashchange", cb); };
}
function read(): AccountTab {
  const h = decodeURIComponent(window.location.hash.slice(1));
  return (ACCOUNT_TABS as readonly string[]).includes(h) ? (h as AccountTab) : "pedidos";
}

/**
 * Sección abierta de Mi cuenta, guardada en el hash (`/cuenta/#regalos`): los links desde otras pantallas abren
 * directo la que corresponde. Elegir otra reemplaza el hash sin sumar entradas al historial ni mover la página.
 */
export function useAccountTab() {
  const tab = useSyncExternalStore(subscribe, read, () => "pedidos" as const);
  const select = useCallback((next: AccountTab) => {
    // Se conserva el estado del router de Next en el historial; solo cambia el fragmento.
    window.history.replaceState(window.history.state, "", `#${next}`);
    listeners.forEach((l) => l());
  }, []);
  return [tab, select] as const;
}

"use client";
import { useCallback, useSyncExternalStore } from "react";

/** Preferencia de este navegador: barra lateral del panel fija abierta. Es solo de interfaz (no datos de la demo). */
const KEY = "volta-ui:admin-sidebar";
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };
// Sin almacenamiento (modo privado estricto) la preferencia vale para esta visita.
let memory = false;
const read = () => { try { return localStorage.getItem(KEY) === "pinned"; } catch { return memory; } };

export function useSidebarPin() {
  const pinned = useSyncExternalStore(subscribe, read, () => false);
  const setPinned = useCallback((next: boolean) => {
    memory = next;
    try { if (next) localStorage.setItem(KEY, "pinned"); else localStorage.removeItem(KEY); } catch { /* queda en memoria */ }
    listeners.forEach((l) => l());
  }, []);
  return [pinned, setPinned] as const;
}

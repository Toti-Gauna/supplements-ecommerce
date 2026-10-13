import { createJSONStorage, type StateStorage } from "zustand/middleware";
import { brand } from "@/config/brand";

/**
 * Prefijo de lo que la demo guarda en el navegador. Con VOLTA sigue siendo "volta-demo:" (no se pierde nada guardado);
 * otra marca usa el suyo, así dos demos publicadas en el mismo dominio (usuario.github.io) no comparten datos.
 */
export const STORAGE_PREFIX = `${brand.storageKey}-demo:`;

/** Versión del estado guardado del panel (la lee también el script del <head> de la tienda). */
// v11: la demo pasa al lunes 5/10/2026 (pedidos, despachos y avisos con la fecha nueva).
// v12: la tienda arranca con la temática original (modo "off") en lugar de la automática por fecha.
export const ADMIN_STORE_VERSION = 12;

/** localStorage tolerante a modo privado / cuota llena: la demo sigue funcionando en memoria. */
const memory = new Map<string, string>();
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return window.localStorage.getItem(name) ?? memory.get(name) ?? null;
    } catch {
      return memory.get(name) ?? null;
    }
  },
  setItem: (name, value) => {
    memory.set(name, value);
    try {
      window.localStorage.setItem(name, value);
    } catch {
      /* cuota llena o bloqueada: queda en memoria */
    }
  },
  removeItem: (name) => {
    memory.delete(name);
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* ignorar */
    }
  },
};

export const demoStorage = createJSONStorage(() => safeStorage);

export function clearDemoStorage(): void {
  memory.clear();
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .forEach((k) => window.localStorage.removeItem(k));
    // Borradores sin guardar del panel (`volta-ui:*-draft:*`, en la pestaña): si quedaran, volverían como "cambios sin
    // guardar" sobre los datos reiniciados. La barra lateral y el regreso de la vista previa se conservan.
    Object.keys(window.sessionStorage)
      .filter((k) => k.startsWith("volta-ui:") && k.includes("-draft"))
      .forEach((k) => window.sessionStorage.removeItem(k));
  } catch {
    /* ignorar */
  }
}

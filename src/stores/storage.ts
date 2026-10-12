import { createJSONStorage, type StateStorage } from "zustand/middleware";

export const STORAGE_PREFIX = "volta-demo:";

/** Versión del estado guardado del panel (la lee también el script del <head> de la tienda). */
export const ADMIN_STORE_VERSION = 9;

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

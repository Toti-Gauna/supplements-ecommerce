import { createJSONStorage, type StateStorage } from "zustand/middleware";

export const STORAGE_PREFIX = "volta-demo:";

/** Versión del estado guardado del panel (la lee también el script del <head> de la tienda). */
export const ADMIN_STORE_VERSION = 8;

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
  } catch {
    /* ignorar */
  }
}

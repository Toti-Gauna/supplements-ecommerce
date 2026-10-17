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
// v13: imágenes propias del carrusel, preservando las ediciones compatibles de v10–v12.
// v14: tienda deportiva multimarca (L2): se suman las categorías y los productos de equipamiento sin tocar lo editado.
// v15: campañas de R3a: días del deporte con sus cupones y rangos nuevos solo donde el dueño no cambió las fechas.
// v16: ayuda del box (R2c): cada pregunta frecuente lleva su tema y se suman las preguntas nuevas.
// v17: regalos (R3b): gift cards con saldo y vencimiento, y el estado de cada regalo, sin tocar lo demás.
// v18: fechas reales de los días del deporte (y Vuelta al gym en marzo) donde el dueño no cambió las de muestra.
export const ADMIN_STORE_VERSION = 18;

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

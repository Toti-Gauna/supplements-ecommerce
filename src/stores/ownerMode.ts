"use client";
import { create } from "zustand";
import { OWNER_OFF, parseOwnerSession, type OwnerSession } from "@/demo/admin/owner-mode";
import { STORAGE_PREFIX } from "./storage";

/** Clave de la pestaña (sessionStorage): el modo dueño no queda prendido para otra visita ni para otro comprador. */
export const OWNER_KEY = `${STORAGE_PREFIX}owner-mode`;

interface OwnerModeState extends OwnerSession {
  /** Ya se leyó la sesión (antes de eso la tienda se dibuja como para cualquier comprador). */
  loaded: boolean;
  /** Aplica una regla pura de `owner-mode.ts` sobre lo guardado y lo recuerda en la pestaña. */
  update: (next: (s: OwnerSession) => OwnerSession) => void;
}

function read(): OwnerSession {
  try {
    return parseOwnerSession(window.sessionStorage.getItem(OWNER_KEY));
  } catch {
    return OWNER_OFF;
  }
}

/**
 * Modo dueño (R4c), aparte del estado del panel: no se rehidrata con los demás stores ni lo borra "Reiniciar demo".
 * Arranca apagado (igual que el HTML estático) y lee la pestaña en el primer `update`.
 */
export const useOwnerMode = create<OwnerModeState>()((set, get) => ({
  ...OWNER_OFF,
  loaded: false,
  update: (next) => {
    const base = get().loaded ? { available: get().available, on: get().on } : read();
    const s = next(base);
    set({ ...s, loaded: true });
    try {
      if (s.available) window.sessionStorage.setItem(OWNER_KEY, JSON.stringify(s));
      else window.sessionStorage.removeItem(OWNER_KEY);
    } catch {
      /* sin almacenamiento: dura hasta recargar */
    }
  },
}));

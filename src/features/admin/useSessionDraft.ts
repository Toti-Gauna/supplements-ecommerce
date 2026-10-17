"use client";
import { useEffect, useRef, useState, type SetStateAction } from "react";

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Borrador de una subpágina en la pestaña (8.3.24): salir a otra sección y volver no pierde lo que no se guardó. Sin
 * cambios no queda nada guardado; lo guardado roto o de otra versión se ignora. `key` vacío: solo en memoria (modales
 * donde cancelar tiene que olvidar lo escrito).
 */
export function useSessionDraft<T>(key: string, saved: T, isValid: (x: unknown) => x is T) {
  const [start] = useState<T | null>(() => {
    if (!key) return null;
    try {
      const raw = sessionStorage.getItem(key);
      const v: unknown = raw ? JSON.parse(raw) : null;
      return isValid(v) && !same(v, saved) ? v : null;
    } catch { return null; }
  });
  const [draft, setDraftState] = useState<T>(start ?? saved);
  const currentDraft = useRef<T>(start ?? saved);
  const [restored, setRestored] = useState(!!start);
  const [storageError, setStorageError] = useState(false);
  const dirty = !same(draft, saved);
  useEffect(() => {
    if (!key || dirty) return;
    try { sessionStorage.removeItem(key); } catch { /* sin almacenamiento: queda en memoria */ }
  }, [key, dirty]);
  const setDraft = (update: SetStateAction<T>) => {
    const next = typeof update === "function" ? (update as (previous: T) => T)(currentDraft.current) : update;
    let failed = false;
    if (key) {
      try { if (!same(next, saved)) sessionStorage.setItem(key, JSON.stringify(next)); else sessionStorage.removeItem(key); }
      catch { failed = true; }
    }
    setStorageError(failed);
    currentDraft.current = next;
    setDraftState(next);
  };
  return {
    draft, dirty, setDraft, storageError,
    restored: restored && dirty,
    /** Vuelve a lo guardado (o a `to`): el borrador de la pestaña se borra solo al quedar sin cambios. */
    reset: (to: T = saved) => {
      currentDraft.current = to; setDraftState(to); setRestored(false); setStorageError(false);
      try { if (key) sessionStorage.removeItem(key); } catch { /* el borrador sigue en memoria */ }
    },
  };
}

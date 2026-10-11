"use client";
import { useEffect, useState } from "react";

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
  const [draft, setDraft] = useState<T>(start ?? saved);
  const [restored, setRestored] = useState(!!start);
  const dirty = !same(draft, saved);
  useEffect(() => {
    if (!key) return;
    try { if (dirty) sessionStorage.setItem(key, JSON.stringify(draft)); else sessionStorage.removeItem(key); } catch { /* sin almacenamiento: queda en memoria */ }
  }, [key, draft, dirty]);
  return {
    draft, dirty, setDraft,
    restored: restored && dirty,
    /** Vuelve a lo guardado (o a `to`): el borrador de la pestaña se borra solo al quedar sin cambios. */
    reset: (to: T = saved) => { setDraft(to); setRestored(false); },
  };
}

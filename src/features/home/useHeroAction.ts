"use client";
import { useCallback, useLayoutEffect, useRef } from "react";

/** Mantiene estable la acción de las escenas, usando siempre el flujo de la diapositiva actual. */
export function useHeroAction<Args extends unknown[]>(action: (...args: Args) => void) {
  const latest = useRef(action);
  useLayoutEffect(() => { latest.current = action; }, [action]);
  return useCallback((...args: Args) => latest.current(...args), []);
}

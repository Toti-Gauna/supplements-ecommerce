"use client";
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * "Reducir movimiento" sin diferencias con el HTML estático: en el servidor (y al hidratar) vale false y enseguida
 * toma el valor del sistema. `useReducedMotion` de motion lee el valor real en el primer render y rompe la hidratación.
 */
export function useReducedMotionSafe(): boolean {
  return useSyncExternalStore(subscribe, () => matchMedia(QUERY).matches, () => false);
}

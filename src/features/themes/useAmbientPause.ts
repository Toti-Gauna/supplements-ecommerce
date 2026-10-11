"use client";
import { useSyncExternalStore } from "react";

const KEY = "volta-ambient";
const CLASS = "amb-paused";

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => obs.disconnect();
}

/** Pausar/reanudar el fondo animado (WCAG 2.2.2). Se recuerda en este navegador; el script del <head> lo aplica. */
export function useAmbientPause() {
  const paused = useSyncExternalStore(subscribe, () => document.documentElement.classList.contains(CLASS), () => false);
  const toggle = () => {
    const next = !paused;
    document.documentElement.classList.toggle(CLASS, next);
    try { window.localStorage.setItem(KEY, next ? "paused" : "on"); } catch { /* sin almacenamiento: solo esta visita */ }
  };
  return { paused, toggle };
}

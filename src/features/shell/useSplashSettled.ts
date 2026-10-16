"use client";
import { useSyncExternalStore } from "react";

/**
 * ¿Ya se retiró la pantalla de carga? (`Splash.tsx`): el script del <head> pone `splash-done` en <html> cuando cae el
 * telón (o con Escape, o por la red de seguridad). Con "reducir movimiento" el splash no se abre, así que no hay que
 * esperar nada; tampoco si el navegador no lo llegó a abrir.
 */
function settled(): boolean {
  const html = document.documentElement;
  if (html.classList.contains("splash-done")) return true;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return true;
  const splash = document.getElementById("volta-splash");
  try {
    return !splash || !splash.matches(":popover-open");
  } catch {
    return true;
  }
}

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

/** Para lo que se abre solo al entrar (como la invitación al quiz): espera a que la tienda esté a la vista. */
export function useSplashSettled(): boolean {
  return useSyncExternalStore(subscribe, settled, () => false);
}

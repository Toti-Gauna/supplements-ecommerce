import { SPLASH_FALLBACK_MS } from "@/components/organisms/Splash";
import { BASE_PATH } from "@/lib/base-path";
import { SPLASH_ACCENT_VARS, SPLASH_VARS, splashMarks, type SplashDate } from "./marks";

let fallback: number | undefined;

/** ¿Se puede mostrar la pantalla de carga? Con "reducir movimiento" no sale (tampoco al repetirla). */
export function canPlaySplash(): boolean {
  if (typeof window === "undefined") return false;
  const el = document.getElementById("volta-splash");
  return !!el && typeof el.showPopover === "function" && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Vuelve a pasar la pantalla de carga de una fecha (o la original con `null`) sin recargar la página: deja en el
 * <html> y en el escenario las mismas marcas que el script del <head>, la abre en la capa superior y arranca de cero.
 * Se retira igual que al cargar (al terminar el telón, con Escape o por la red de seguridad). Devuelve si salió.
 */
export function playSplash(date: SplashDate | null): boolean {
  if (!canPlaySplash()) return false;
  const html = document.documentElement;
  const el = document.getElementById("volta-splash")!;
  const stage = el.querySelector<HTMLElement>(".splash-stage");
  const marks = splashMarks(date, BASE_PATH);
  for (const a of ["data-splash-scene", "data-splash-campaign", "data-splash-dn", "data-splash-off"]) html.removeAttribute(a);
  for (const v of SPLASH_VARS) html.style.removeProperty(v);
  for (const v of SPLASH_ACCENT_VARS) el.style.removeProperty(v);
  for (const [k, v] of Object.entries(marks.vars)) (SPLASH_ACCENT_VARS.includes(k) ? el : html).style.setProperty(k, v);
  if (marks.campaign) html.setAttribute("data-splash-campaign", "");
  if (marks.scene) html.setAttribute("data-splash-scene", marks.scene);
  if (marks.digits) html.setAttribute("data-splash-dn", String(marks.digits));
  stage?.toggleAttribute("data-scene", false);
  stage?.toggleAttribute("data-dn", false);
  if (marks.scene) stage?.setAttribute("data-scene", marks.scene);
  if (marks.digits) stage?.setAttribute("data-dn", String(marks.digits));
  // Cerrada y vuelta a abrir con un cálculo de estilos en el medio: las animaciones arrancan de cero.
  html.classList.remove("splash-done");
  try { if (el.matches(":popover-open")) el.hidePopover(); } catch { /* ya estaba cerrada */ }
  void el.offsetWidth;
  try { el.showPopover(); } catch { return false; }
  window.clearTimeout(fallback);
  fallback = window.setTimeout(() => {
    html.classList.add("splash-done");
    try { if (el.matches(":popover-open")) el.hidePopover(); } catch { /* ya se cerró */ }
  }, SPLASH_FALLBACK_MS);
  return true;
}

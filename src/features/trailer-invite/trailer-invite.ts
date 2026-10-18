import { brand } from "@/config/brand";

/**
 * Invitación al trailer (pedido de Ignacio, 18/10/2026): mientras el trailer está en construcción, después de la
 * pantalla de carga la tienda ofrece verlo ("Ver trailer" / "No por ahora"). Aparece una vez por sesión del navegador,
 * así cada visita nueva muestra el avance. Si `localStorage` ya la tiene vista (los tests, playwright.config.ts) no sale.
 */
export const TRAILER_INVITE_KEY = `${brand.storageKey}-trailer-invite`;

/** Pieza que abre "Ver trailer": la que muestra cómo va el trabajo. */
export const TRAILER_INVITE_HREF = "/trailer/firma/";

/** Igual que la invitación al quiz: ni en la compra, ni en el panel, ni en los enlaces puntuales (regalo, pedido). */
const SKIP = ["/crear/quiz", "/quiz", "/checkout", "/admin-demo", "/regalo", "/pedido", "/trailer"];
const normalize = (path: string) => `/${path.replace(/^\/+|\/+$/g, "")}`;

export function shouldInviteToTrailer({ path, seen }: { path: string; seen: boolean }): boolean {
  if (seen) return false;
  const p = normalize(path);
  return !SKIP.some((s) => p === s || p.startsWith(`${s}/`));
}

/** ¿Ya la vio en esta sesión (o los tests la marcaron)? Sin almacenamiento se da por vista: no insistir. */
export function trailerInviteSeen(): boolean {
  try {
    return window.sessionStorage.getItem(TRAILER_INVITE_KEY) !== null || window.localStorage.getItem(TRAILER_INVITE_KEY) !== null;
  } catch {
    return true;
  }
}

export function rememberTrailerInvite(choice: "ver" | "no"): void {
  try {
    window.sessionStorage.setItem(TRAILER_INVITE_KEY, choice);
  } catch {
    /* sin almacenamiento: no se recuerda */
  }
}

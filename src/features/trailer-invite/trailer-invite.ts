import { brand } from "@/config/brand";

/**
 * Invitación al trailer (pedido de Ignacio, 18/10/2026): mientras el trailer está en construcción, después de la
 * pantalla de carga la tienda ofrece verlo ("Ver trailer" / "No por ahora"). Aparece en cada carga de la página (ver `invite-flow.ts`).
 * Con la clave en "seen" queda apagada: así la apagan los tests (playwright.config.ts).
 */
export const TRAILER_INVITE_KEY = `${brand.storageKey}-trailer-invite`;

/** Pieza que abre "Ver trailer": la más nueva terminada (T1; pasa a T2 cuando esté lista). La firma queda en `/trailer/firma/`. */
export const TRAILER_INVITE_HREF = "/trailer/t1/";

/** Igual que la invitación al quiz: ni en la compra, ni en el panel, ni en los enlaces puntuales (regalo, pedido). */
const SKIP = ["/crear/quiz", "/quiz", "/checkout", "/admin-demo", "/regalo", "/pedido", "/trailer"];
const normalize = (path: string) => `/${path.replace(/^\/+|\/+$/g, "")}`;

export function shouldInviteToTrailer({ path, seen }: { path: string; seen: boolean }): boolean {
  if (seen) return false;
  const p = normalize(path);
  return !SKIP.some((s) => p === s || p.startsWith(`${s}/`));
}

/** ¿Está apagada (la clave en "seen", como la dejan los tests)? Sin almacenamiento se da por apagada: no insistir. */
export function trailerInviteOff(): boolean {
  try {
    return window.localStorage.getItem(TRAILER_INVITE_KEY) === "seen";
  } catch {
    return true;
  }
}

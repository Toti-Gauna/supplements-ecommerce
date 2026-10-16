import { brand } from "@/config/brand";

/**
 * Invitación al quiz (L4, pedido de Ignacio): la primera vez que alguien entra a la tienda, después de la pantalla de
 * carga, un modal lo invita a hacer el quiz. Se muestra una sola vez por navegador.
 *
 * La clave va FUERA del prefijo de la demo (`volta-demo:`): "Reiniciar demo" no la borra (no vuelve a aparecer cada
 * vez que alguien reinicia para mostrar la tienda) y los tests la dejan marcada de entrada (playwright.config.ts).
 */
export const QUIZ_INVITE_KEY = `${brand.storageKey}-quiz-invite`;

/** Lo que eligió: hacer el quiz o "Ahora no". Cualquier valor guardado cuenta como visto. */
export type QuizInviteChoice = "quiz" | "no";

/**
 * Rutas donde la invitación no aparece: el quiz mismo, la compra, el panel y los enlaces que alguien abre por un motivo
 * puntual (el regalo que le mandaron, el seguimiento de su pedido). Ahí un modal de entrada solo estorba.
 */
const SKIP = ["/crear/quiz", "/quiz", "/checkout", "/admin-demo", "/regalo", "/pedido"];

/** Ruta sin basePath ni barra final: "/checkout/confirmacion/" → "/checkout/confirmacion". */
const normalize = (path: string) => `/${path.replace(/^\/+|\/+$/g, "")}`;

export function shouldInviteToQuiz({ path, seen }: { path: string; seen: boolean }): boolean {
  if (seen) return false;
  const p = normalize(path);
  return !SKIP.some((s) => p === s || p.startsWith(`${s}/`));
}

/** ¿Ya la vio? Sin almacenamiento (modo privado, bloqueado) se da por vista: mejor no insistir en cada página. */
export function inviteSeen(): boolean {
  try {
    return window.localStorage.getItem(QUIZ_INVITE_KEY) !== null;
  } catch {
    return true;
  }
}

export function rememberInvite(choice: QuizInviteChoice): void {
  try {
    window.localStorage.setItem(QUIZ_INVITE_KEY, choice);
  } catch {
    /* sin almacenamiento: no se recuerda */
  }
}

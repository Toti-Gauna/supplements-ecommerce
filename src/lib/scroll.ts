/** Desplazamiento suave salvo que la persona pida menos movimiento (prefers-reduced-motion). */
export function scrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined") return "auto";
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

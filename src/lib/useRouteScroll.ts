"use client";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

/** Durante cuánto tiempo después de navegar se corrige la posición si algo la mueve (la transición de página). */
const SETTLE_MS = 600;

/** Lleva al inicio real de la página o, si el link trae ancla (`/p/collar/#personalizar`), a esa sección. */
function scrollToStart() {
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id ? document.getElementById(id) : null;
  if (!target) {
    if (scrollY !== 0) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    return;
  }
  // La sección queda debajo del header fijo: su scroll-margin si lo tiene, si no el alto del header y un poco de aire.
  const header = document.querySelector<HTMLElement>("[data-shop-header]");
  const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || (header?.offsetHeight ?? 0) + 16;
  const top = Math.max(0, Math.round(target.getBoundingClientRect().top + scrollY - margin));
  if (Math.abs(scrollY - top) > 1) window.scrollTo({ top, left: 0, behavior: "instant" });
}

/**
 * Cada página nueva abre desde su cabecera (pedido de Ignacio, Polish 8.2.5). El router de Next, al cambiar de
 * página, lleva a la vista el primer elemento de la página nueva: con el header fijo encima, el título quedaba tapado,
 * y con la transición entre páginas la posición se movía un cuadro después. Acá se resuelve en un solo lugar: al
 * cambiar la ruta se va al inicio (o al ancla) y se sostiene durante la transición, salvo que la persona ya se esté
 * moviendo. No se toca la primera carga (el navegador restaura al recargar), Atrás/Adelante (vuelve a donde estaba)
 * ni los cambios que no cambian la ruta (filtros, búsqueda, pestañas).
 */
export function useRouteScroll() {
  const pathname = usePathname();
  const last = useRef(pathname);
  // Dirección a la que llevó el último Atrás/Adelante: esa página la restaura el navegador.
  const popped = useRef<string | null>(null);
  useEffect(() => {
    const onPop = () => { popped.current = location.href; };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useLayoutEffect(() => {
    if (last.current === pathname) return;
    last.current = pathname;
    if (popped.current === location.href) { popped.current = null; return; }
    scrollToStart();
    let moved = false, raf = 0;
    const stop = () => { moved = true; };
    const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    for (const e of events) window.addEventListener(e, stop, { passive: true, once: true });
    const until = performance.now() + SETTLE_MS;
    const hold = () => {
      if (moved) return;
      scrollToStart();
      if (performance.now() < until) raf = requestAnimationFrame(hold);
    };
    raf = requestAnimationFrame(hold);
    return () => { cancelAnimationFrame(raf); for (const e of events) window.removeEventListener(e, stop); };
  }, [pathname]);
}

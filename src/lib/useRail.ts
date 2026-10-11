"use client";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { scrollBehavior } from "./scroll";

/** Margen para dar por llegado un borde (Safari informa el scroll con decimales). */
const EDGE = 2;

/** Posición de scroll que deja cada hijo pegado al inicio del riel (respetando scroll-padding): sus puntos de snap. */
function snapPoints(el: HTMLElement) {
  const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
  const origin = el.getBoundingClientRect().left + el.clientLeft - el.scrollLeft;
  return [...el.children].map((c) => c.getBoundingClientRect().left - origin - pad);
}

/**
 * Riel horizontal con snap (productos, categorías). Avisa si hay más contenido a cada lado y pasa de a páginas de
 * tarjetas enteras: el destino es siempre un punto de snap, así el navegador no corrige la posición al terminar (ese
 * salto tardío es lo que se veía al ir y volver). Se recalcula al scrollear, al cambiar el tamaño y cuando cambia la
 * lista (`itemsKey`).
 */
export function useRail<T extends HTMLElement>(itemsKey: string) {
  const ref = useRef<T>(null);
  // Hasta medir, se asume que no hay nada para recorrer (así es el HTML del servidor).
  const [edges, setEdges] = useState({ atStart: true, atEnd: true });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      const atStart = el.scrollLeft <= EDGE, atEnd = el.scrollLeft >= max - EDGE;
      setEdges((e) => (e.atStart === atStart && e.atEnd === atEnd ? e : { atStart, atEnd }));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    for (const c of el.children) ro.observe(c);
    return () => { el.removeEventListener("scroll", update); ro.disconnect(); };
  }, [itemsKey]);
  const page = useCallback((dir: 1 | -1) => {
    const el = ref.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const points = snapPoints(el);
    const style = getComputedStyle(el);
    const view = el.clientWidth - (parseFloat(style.scrollPaddingLeft) || 0) - (parseFloat(style.scrollPaddingRight) || 0);
    const step = points.length > 1 ? points[1]! - points[0]! : first.offsetWidth;
    const gap = step - first.offsetWidth;
    // Tarjetas que entran enteras; la página empieza en la primera que hoy está entera a la vista.
    const perPage = Math.max(1, Math.floor((view + gap + EDGE) / step));
    const current = Math.max(0, points.findIndex((p) => p >= el.scrollLeft - EDGE));
    const target = Math.min(points.length - 1, Math.max(0, current + dir * perPage));
    const max = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: Math.min(max, Math.max(0, points[target]!)), behavior: scrollBehavior() });
  }, []);
  return { ref, ...edges, page };
}

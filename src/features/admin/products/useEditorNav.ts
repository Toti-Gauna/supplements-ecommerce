"use client";
import { useEffect, useRef, useState } from "react";
import type { StepId } from "@/demo/admin/product-steps";

const html = () => document.documentElement;
const padTop = () => parseFloat(html().style.scrollPaddingTop) || 0;

/**
 * Navegación del editor por pasos (8.3.20). Mide lo que queda fijo arriba (barra del panel y pasos compactos) y abajo
 * (barra de guardado y pestañas) y lo pasa a `scroll-padding`: así ni los bloques ni un campo enfocado con Tab quedan
 * tapados. El paso actual sale de la posición del scroll o del campo enfocado; tocar un paso lleva a su bloque.
 */
export function useEditorNav(initial: StepId) {
  const [current, setCurrent] = useState<StepId>(initial);
  /**
   * Paso elegido (o restaurado) y adónde se está yendo: hasta llegar, el scroll no cambia el paso actual, y al llegar
   * queda ese aunque el bloque no alcance a subir hasta arriba (los últimos, al final de la página).
   */
  const target = useRef<{ y?: number; until: number } | null>(null);

  useEffect(() => {
    const topbar = document.querySelector<HTMLElement>("[data-admin-topbar]");
    const compact = document.querySelector<HTMLElement>("[data-compact-steps]");
    const bar = document.querySelector<HTMLElement>("[data-editor-bar]");
    const update = () => {
      const top = topbar?.offsetHeight ?? 0;
      const steps = compact && getComputedStyle(compact).display !== "none" ? compact.offsetHeight : 0;
      const bottom = bar ? bar.offsetHeight + (parseFloat(getComputedStyle(bar).bottom) || 0) : 0;
      html().style.setProperty("--editor-top", `${top}px`);
      html().style.scrollPaddingTop = `${top + steps + 16}px`;
      html().style.scrollPaddingBottom = `${bottom + 16}px`;
    };
    update();
    const ro = new ResizeObserver(update);
    for (const el of [topbar, compact, bar]) if (el) ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      html().style.removeProperty("--editor-top");
      html().style.scrollPaddingTop = "";
      html().style.scrollPaddingBottom = "";
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const maxY = html().scrollHeight - innerHeight;
      if (target.current) {
        const { y } = target.current;
        const arrived = y !== undefined && Math.abs(scrollY - Math.min(y, maxY)) < 2;
        if (arrived || performance.now() < target.current.until) { if (arrived) target.current = null; return; }
        target.current = null;
      }
      const sections = [...document.querySelectorAll<HTMLElement>("[data-step]")];
      if (!sections.length) return;
      // El paso actual es el bloque que está arriba de todo, justo debajo de lo fijo; al final de la página, el último.
      const line = padTop() + 24;
      let id = sections[0]!.dataset.step;
      for (const s of sections) if (s.getBoundingClientRect().top <= line) id = s.dataset.step;
      if (scrollY >= maxY - 4) id = sections.at(-1)!.dataset.step;
      setCurrent(id as StepId);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const onFocus = (e: FocusEvent) => {
      const step = (e.target as Element | null)?.closest?.<HTMLElement>("[data-step]")?.dataset.step;
      // Enfocar el título al tocar un paso no corta el viaje hacia ese paso.
      if (!step || (target.current && performance.now() < target.current.until)) return;
      target.current = { until: performance.now() + 400 };
      setCurrent(step as StepId);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("focusin", onFocus);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); document.removeEventListener("focusin", onFocus); };
  }, []);

  /** Lleva al bloque (debajo de lo fijo) y enfoca su título, sin tocar el borrador. */
  const goTo = (id: StepId) => {
    const el = document.getElementById(`paso-${id}`);
    if (!el) return;
    const y = Math.max(0, Math.round(el.getBoundingClientRect().top + scrollY - padTop()));
    target.current = { y, until: performance.now() + 2000 };
    setCurrent(id);
    const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: y, behavior: smooth ? "smooth" : "instant" });
    document.getElementById(`paso-${id}-t`)?.focus({ preventScroll: true });
  };

  /** Al volver de la vista previa: misma posición y mismo paso. */
  const restore = (y: number, step: StepId) => {
    target.current = { y, until: performance.now() + 1000 };
    setCurrent(step);
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "instant" })));
  };

  return { current, goTo, restore };
}

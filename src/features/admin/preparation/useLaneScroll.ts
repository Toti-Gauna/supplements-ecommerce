"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Carriles del tablero en tablet y celular (8.3.16): los atajos llevan el carril a la vista dentro del tablero y se
 * marcan solos al deslizar. Cada carril lleva `data-column` con su id.
 */
export function useLaneScroll<T extends string>(initial: T) {
  const [tab, setTab] = useState<T>(initial);
  const scroller = useRef<HTMLDivElement>(null);
  const goTo = (col: T) => {
    setTab(col);
    const el = scroller.current, lane = el?.querySelector<HTMLElement>(`[data-column="${col}"]`);
    if (el && lane) el.scrollTo({ left: lane.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const lanes = [...el.querySelectorAll<HTMLElement>("[data-column]")];
        const nearest = lanes.reduce((a, b) => (Math.abs(b.offsetLeft - el.scrollLeft) < Math.abs(a.offsetLeft - el.scrollLeft) ? b : a));
        setTab(nearest.dataset.column as T);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(frame); el.removeEventListener("scroll", onScroll); };
  }, []);
  return { tab, goTo, scroller };
}

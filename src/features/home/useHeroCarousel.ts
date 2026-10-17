"use client";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { scrollBehavior } from "@/lib/scroll";
import { useHydrated } from "@/stores/hydration";

/** Carril nativo: pausa al interactuar, con foco, mouse, pestaña oculta o movimiento reducido (sin autoplay). */
export function useHeroCarousel(total: number) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const latestIndex = useRef(index);
  useEffect(() => { latestIndex.current = index; }, [index]);
  const [paused, setPaused] = useState(false);
  const [prepared, setPrepared] = useState(false);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [visible, setVisible] = useState(true);
  const hydrated = useHydrated();
  const preference = useReducedMotion();
  const reduce = hydrated && preference === true;
  const auto = hydrated && !reduce && !paused && !hover && !focus && visible && total > 1;
  const go = useCallback((i: number) => {
    const el = track.current;
    if (!el || !total) return;
    setPrepared(true);
    const next = (i + total) % total;
    latestIndex.current = next;
    el.scrollTo({ left: next * el.clientWidth, behavior: scrollBehavior() });
  }, [total]);
  // El reloj del autoplay es la barra de carga del carril actual (CSS): se congela con la pausa y avisa al terminar.
  const lap = useCallback(() => { if (auto) go(latestIndex.current + 1); }, [auto, go]);
  useEffect(() => {
    const change = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", change);
    change();
    return () => document.removeEventListener("visibilitychange", change);
  }, []);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const observer = new ResizeObserver(() => el.scrollTo({ left: latestIndex.current * el.clientWidth, behavior: "instant" }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { track, index, setIndex, paused, setPaused, setHover, setFocus, reduce, hydrated, auto, go, lap, prepared, prepare: () => setPrepared(true) };
}

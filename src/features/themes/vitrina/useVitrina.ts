"use client";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { calendarOrder } from "@/demo/engine/campaign-window";
import { demoData } from "@/demo/engine/source";
import type { SeasonId } from "@/demo/types";
import { useDemoData } from "@/stores/admin";
import { useThemePreview } from "@/stores/themePreview";

/** Cuánto queda cada fecha en pantalla con la reproducción automática. */
export const VITRINA_INTERVAL = 4500;

/** Arranca la vitrina en la fecha pedida (o en la primera del calendario). No recarga ni guarda nada. */
export function startVitrina(from?: SeasonId | null): void {
  const themes = calendarOrder(demoData().themes.filter((t) => t.active));
  const first = themes.find((t) => t.id === from) ?? themes[0];
  if (first) useThemePreview.getState().setVitrina(first.id);
}

/** Sale de la vitrina: la tienda vuelve a la vista previa de antes (nada quedó guardado). */
export function exitVitrina(): void {
  useThemePreview.getState().setVitrina(null);
}

/**
 * Modo vitrina (R3a): recorre las fechas habilitadas en orden de calendario sin recargar la página (cambia la vista
 * previa en memoria y la tienda se re-pinta sola). Anterior/siguiente, reproducción automática con pausa (se pausa con
 * la pestaña oculta y arranca en pausa con "reducir movimiento") y Escape para salir.
 */
export function useVitrina() {
  const all = useDemoData((d) => d.themes);
  const themes = useMemo(() => calendarOrder(all.filter((t) => t.active)), [all]);
  const current = useThemePreview((s) => s.vitrinaId);
  const reduce = useReducedMotion() === true;
  const [playing, setPlaying] = useState(!reduce);
  const [visible, setVisible] = useState(true);
  const index = Math.max(0, themes.findIndex((t) => t.id === current));
  const step = useCallback((delta: number) => {
    const n = themes.length;
    if (!n) return;
    const at = Math.max(0, themes.findIndex((t) => t.id === useThemePreview.getState().vitrinaId));
    useThemePreview.getState().setVitrina(themes[(at + delta + n) % n]!.id);
  }, [themes]);
  const running = playing && visible;
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => step(1), VITRINA_INTERVAL);
    return () => window.clearTimeout(id);
  }, [running, step, current]);
  useEffect(() => {
    const change = () => setVisible(document.visibilityState === "visible");
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented || document.querySelector("[aria-modal='true']")) return;
      exitVitrina();
    };
    document.addEventListener("visibilitychange", change);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("visibilitychange", change); document.removeEventListener("keydown", key); };
  }, []);
  return { themes, theme: themes[index] ?? null, index, total: themes.length, playing, running, setPlaying, step, exit: exitVitrina };
}

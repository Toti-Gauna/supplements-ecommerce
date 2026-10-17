"use client";
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";

/** Lo que tarda la barra en cargarse entera manteniendo apretado. */
export const CHARGE_MS = 1100;

/**
 * "Cargá la barra": mantener apretado (dedo, mouse, Espacio o Enter) carga la barra de 0 a 1 y al soltar se gira con
 * esa fuerza. Un clic de lector de pantalla (sin apretar y soltar) gira con la fuerza normal. El premio no depende de
 * la carga: lo decide el sorteo del engine; la carga solo cambia cuántas vueltas da el disco.
 */
export function useBarCharge(onRelease: (charge: number) => void, enabled: boolean) {
  const [charge, setCharge] = useState(0);
  const [holding, setHolding] = useState(false);
  const start = useRef<number | null>(null);
  const frame = useRef(0);
  const release = useRef(onRelease);
  useEffect(() => { release.current = onRelease; }, [onRelease]);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const begin = () => {
    if (!enabled || start.current !== null) return;
    const t0 = performance.now();
    start.current = t0;
    setHolding(true);
    setCharge(0);
    const tick = () => {
      if (start.current !== t0) return;
      const c = Math.min(1, (performance.now() - t0) / CHARGE_MS);
      setCharge(c);
      if (c < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };
  const finish = (fire: boolean) => {
    if (start.current === null) return;
    const c = Math.min(1, (performance.now() - start.current) / CHARGE_MS);
    start.current = null;
    cancelAnimationFrame(frame.current);
    setHolding(false);
    setCharge(fire ? c : 0);
    if (fire) release.current(c);
  };
  const isKey = (e: KeyboardEvent) => e.key === " " || e.key === "Enter";
  const handlers = {
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      begin();
    },
    onPointerUp: () => finish(true),
    onPointerCancel: () => finish(false),
    onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => { if (isKey(e)) { e.preventDefault(); if (!e.repeat) begin(); } },
    onKeyUp: (e: KeyboardEvent<HTMLButtonElement>) => { if (isKey(e)) { e.preventDefault(); finish(true); } },
    onClick: (e: MouseEvent<HTMLButtonElement>) => { if (e.detail === 0 && enabled && start.current === null) release.current(0.5); },
  };
  return { charge, holding, handlers };
}

"use client";
import { useEffect, useRef, useState } from "react";

/** Salida con un rebote corto (como una barra que llega y se asienta). */
const easeOutBack = (k: number) => 1 + 2.2 * (k - 1) ** 3 + 1.2 * (k - 1) ** 2;

/**
 * Lleva un número hacia `target` en `ms` (requestAnimationFrame, sin bucles: se detiene al llegar). Con `instant`
 * (reducir movimiento o cámara lenta ya resuelta) devuelve el valor de una.
 */
export function useTween(target: number, ms = 520, instant = false): number {
  const [value, setValue] = useState(target);
  const current = useRef(target);
  useEffect(() => {
    if (instant) { current.current = target; return; }
    const from = current.current;
    if (from === target) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / ms);
      current.current = from + (target - from) * easeOutBack(k);
      setValue(current.current);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, instant]);
  return instant ? target : value;
}

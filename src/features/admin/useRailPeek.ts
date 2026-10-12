"use client";
import { useEffect, useRef, useState, type PointerEvent } from "react";

/**
 * Cuánto tiene que quedarse el mouse sobre el riel para desplegarlo: cruzarlo de pasada camino al contenido (o rozar el
 * borde izquierdo) ya no lo abre encima de la página. Es detección de intención, no animación: vale también con
 * "reducir movimiento".
 */
export const RAIL_PEEK_DELAY = 400;

/** Riel del panel: se despliega con el mouse después de un momento y se cierra apenas sale. Teclado y "Fijar" van aparte. */
export function useRailPeek(delay = RAIL_PEEK_DELAY) {
  const [peek, setPeek] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const onPointerEnter = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPeek(true), delay);
  };
  const onPointerLeave = () => {
    window.clearTimeout(timer.current);
    setPeek(false);
  };
  // Un clic adentro es intención clara: abre ya. Si venía abierto por el teclado, no se cierra entre apretar y soltar
  // (al hacer clic se pierde el foco visible y el botón quedaría fuera del riel angosto).
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(timer.current);
    setPeek(true);
  };
  return { peek, onPointerEnter, onPointerLeave, onPointerDown };
}

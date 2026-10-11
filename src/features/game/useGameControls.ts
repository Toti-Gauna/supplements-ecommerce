"use client";
import { useEffect, useRef, type PointerEvent } from "react";

/** Lo que pidió el jugador: x de destino (dedo o mouse) o teclas apretadas. Se lee en cada cuadro desde un ref. */
export interface Control {
  targetX: number | null;
  left: boolean;
  right: boolean;
}

interface Options {
  /** Apuntar a una x de la pantalla (dedo o mouse). */
  aim: (clientX: number) => void;
  /** Tecla de dirección apretada o soltada. */
  steer: (side: "left" | "right", down: boolean) => void;
  isCanvas: (target: EventTarget | null) => boolean;
  onPause: () => void;
  onEscape: () => void;
}

const LEFT = new Set(["ArrowLeft", "KeyA", "a", "A"]);
const RIGHT = new Set(["ArrowRight", "KeyD", "d", "D"]);

/**
 * Entrada de Shaker Rush: arrastrar con el dedo, mover el mouse, flechas o A/D. Escape (o P) pausa; cambiar de
 * pestaña o de ventana también. El arrastre solo empieza sobre el canvas, así los botones de las capas no pierden el clic.
 */
export function useGameControls(options: Options) {
  const dragging = useRef<number | null>(null);
  const actions = useRef(options);
  useEffect(() => { actions.current = options; });

  useEffect(() => {
    const key = (e: KeyboardEvent, down: boolean) => {
      const a = actions.current;
      if (LEFT.has(e.code) || LEFT.has(e.key)) { a.steer("left", down); e.preventDefault(); }
      else if (RIGHT.has(e.code) || RIGHT.has(e.key)) { a.steer("right", down); e.preventDefault(); }
      else if (down && e.key === "Escape") { e.preventDefault(); a.onEscape(); }
      else if (down && (e.key === "p" || e.key === "P")) a.onPause();
    };
    const onDown = (e: KeyboardEvent) => key(e, true);
    const onUp = (e: KeyboardEvent) => key(e, false);
    const onHide = () => { if (document.hidden) actions.current.onPause(); };
    // Al perder el foco se sueltan las teclas (si no, el shaker seguiría yendo hacia un lado al volver).
    const onBlur = () => { actions.current.steer("left", false); actions.current.steer("right", false); actions.current.onPause(); };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  return {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (!actions.current.isCanvas(e.target) || (e.pointerType === "mouse" && e.button !== 0)) return;
      dragging.current = e.pointerId;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      actions.current.aim(e.clientX);
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (dragging.current === e.pointerId || (e.pointerType === "mouse" && actions.current.isCanvas(e.target))) actions.current.aim(e.clientX);
    },
    onPointerUp: (e: PointerEvent<HTMLElement>) => { if (dragging.current === e.pointerId) dragging.current = null; },
    onPointerCancel: () => { dragging.current = null; },
  };
}

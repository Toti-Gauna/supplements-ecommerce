"use client";
import { useCallback, useEffect, useRef } from "react";
import { WORLD_W, clampHeight } from "@/demo/engine/game";
import { fitView, type View } from "./render";

interface Options {
  /** Cambió el tamaño del campo: alto del mundo en unidades. */
  onResize: (worldH: number) => void;
  /** Un cuadro: `dt` en segundos (limitado a 50 ms) y el contexto listo para dibujar. */
  frame: (dt: number, ctx: CanvasRenderingContext2D, view: View) => void;
}

/**
 * Canvas del juego: tamaño por devicePixelRatio (tope 2: arriba no se nota y cuesta el triple), un solo loop de
 * requestAnimationFrame con delta limitado, y limpieza al desmontar. Devuelve refs de función para el canvas y el
 * campo (así el componente no lee refs al renderizar) y la conversión de la x de la pantalla a la del mundo.
 */
export function useArenaLoop({ onResize, frame }: Options) {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const arena = useRef<HTMLDivElement | null>(null);
  const view = useRef<View | null>(null);
  const handlers = useRef({ onResize, frame });
  useEffect(() => { handlers.current = { onResize, frame }; }, [onResize, frame]);

  useEffect(() => {
    const el = canvas.current, box = arena.current;
    const ctx = el?.getContext("2d");
    if (!el || !box || !ctx) return;
    const resize = () => {
      const { width, height } = box.getBoundingClientRect();
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const worldH = clampHeight(height / (width / WORLD_W));
      view.current = fitView(width, height, dpr, worldH);
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      handlers.current.onResize(worldH);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    let raf = 0, last = -1;
    const loop = (now: number) => {
      const dt = last < 0 ? 0 : Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      if (view.current) handlers.current.frame(dt, ctx, view.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  const bindCanvas = useCallback((el: HTMLCanvasElement | null) => { canvas.current = el; }, []);
  const bindArena = useCallback((el: HTMLDivElement | null) => { arena.current = el; }, []);
  const toWorldX = useCallback((clientX: number) => {
    const v = view.current, box = arena.current;
    return v && box ? (clientX - box.getBoundingClientRect().left - v.ox) / v.scale : null;
  }, []);
  const isCanvas = useCallback((target: EventTarget | null) => target !== null && target === canvas.current, []);
  return { bindCanvas, bindArena, toWorldX, isCanvas };
}

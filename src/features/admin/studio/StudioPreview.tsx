"use client";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { drawSlide } from "./render/carousel";
import { drawPost, drawStory } from "./render/templates";
import type { StudioScene } from "./render/types";

/** Dibuja la pieza en el instante t (el carrusel, la diapositiva pedida). */
export function drawFrame(ctx: CanvasRenderingContext2D, scene: StudioScene, t: number, slide = 0) {
  ctx.clearRect(0, 0, scene.W, scene.H);
  if (scene.format === "post") drawPost(ctx, scene, t);
  else if (scene.format === "story") drawStory(ctx, scene, t);
  else drawSlide(ctx, scene, slide, t);
}

/** Espera a que estén las fuentes de la marca (el canvas no las usa hasta que cargan). */
export function useFontsReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    Promise.all([document.fonts.load('600 80px "Fraunces Variable"'), document.fonts.load('800 40px "Manrope Variable"'), document.fonts.load('500 40px "Manrope Variable"')])
      .catch(() => [])
      .then(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, []);
  return ready;
}

/**
 * Vista previa en canvas a escala. `animate` la reproduce en bucle (con "reducir movimiento" queda en el cuadro
 * final, el mismo que se exporta como imagen).
 */
export function StudioPreview({ scene, slide = 0, animate, replay = 0, scale, label, decorative, className }: {
  scene: StudioScene; slide?: number; animate: boolean; replay?: number; scale: number; label: string; decorative?: boolean; className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const fonts = useFontsReady();
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = Math.round(scene.W * scale);
    canvas.height = Math.round(scene.H * scale);
    const paint = (t: number) => { ctx.setTransform(scale, 0, 0, scale, 0, 0); drawFrame(ctx, scene, t, slide); };
    if (!animate || reduce) { paint(scene.duration); return; }
    // Se reproduce una vez y queda en el cuadro final (sin animaciones permanentes); "Ver animación" la repite.
    let raf = 0;
    const start = performance.now();
    const loop = () => {
      const t = (performance.now() - start) / 1000;
      paint(Math.min(t, scene.duration));
      if (t < scene.duration) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [scene, slide, animate, replay, reduce, scale, fonts]);
  return <canvas ref={ref} role={decorative ? undefined : "img"} aria-hidden={decorative || undefined} aria-label={decorative ? undefined : label}
    className={cn("block h-auto w-full rounded-2xl bg-night shadow-[var(--shadow-card)]", className)} style={{ aspectRatio: `${scene.W} / ${scene.H}` }} />;
}

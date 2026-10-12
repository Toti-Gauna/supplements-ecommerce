"use client";
import { createContext, useCallback, useContext, type CSSProperties } from "react";

/** Herramientas comunes de las escenas de la pantalla de carga (motion graphics en CSS de ~4,3 s). */

/**
 * Reloj de la escena: segundos de pantalla de carga que ya pasaron cuando la escena se montó (llega recién al
 * hidratar, pero el telón cae a los 4,35 s desde que se pintó). Cada retraso se corre esa cantidad: con retraso
 * negativo la animación arranca por la mitad y la escena termina a tiempo aunque el teléfono tarde en cargar.
 */
export const SceneClock = createContext(0);

/** `at(s)`: el momento s de la escena, corrido por el reloj. */
export function useAt(): (s: number) => number {
  const offset = useContext(SceneClock);
  return useCallback((s: number) => s - offset, [offset]);
}

/** `d(s)`: estilo con el retraso de animación del momento s (o varios, separados por coma). */
export function useDelay(): (...s: number[]) => CSSProperties {
  const at = useAt();
  return useCallback((...s: number[]) => ({ animationDelay: s.map((x) => `${at(x).toFixed(3)}s`).join(", ") }), [at]);
}

/** Segundos que lleva el telón de la pantalla de carga (0 si no se puede medir), con tope para no saltear la escena entera. */
export function splashElapsed(): number {
  if (typeof document === "undefined") return 0;
  const anim = document.getElementById("volta-splash")?.getAnimations?.().find((a) => (a as CSSAnimation).animationName === "splash-curtain");
  const ms = Number(anim?.currentTime ?? 0);
  return Math.min(Math.max(ms / 1000 - 0.15, 0), 2.6);
}

/**
 * CSS propio de una escena, en su mismo archivo diferido (React lo sube al <head> una sola vez). Las escenas animan
 * con CSS (transform/opacity, que corre en la placa de video) y corren sus retrasos con `at()`.
 */
export function SceneCss({ id, css }: { id: string; css: string }) {
  return <style href={`splash-scene-${id}`} precedence="default">{css}</style>;
}

/** Pseudoaleatorio determinístico (mismas posiciones en cada visita). */
export function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Variables CSS en línea sin pelear con los tipos de React. */
export const vars = (o: Record<string, string | number>) => o as CSSProperties;

/** Props de toda escena: la oferta de la temática ya armada por el engine ("30% OFF"), si la hay. */
export interface SceneProps { offer: string | null }

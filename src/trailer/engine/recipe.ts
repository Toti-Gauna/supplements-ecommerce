import type { FC } from "react";
import type { Note } from "../audio/score";
import type { Ratio, StageSize } from "../core/types";
import type { Timeline } from "./gsap";

/** Lo que recibe una receta al armar su escena. Todos los tiempos son relativos (0 = inicio de la escena). */
export interface SceneCtx<P> {
  /** El `[data-escena]` de esta escena: la receta solo anima lo que está adentro. */
  root: HTMLElement;
  /** Selecciona dentro de la escena (`q('[data-t="titulo"]')`). */
  q: (selector: string) => HTMLElement[];
  props: P;
  dur: number;
  ratio: Ratio;
  stage: StageSize;
  /** Movimiento reducido: la receta arma una lámina quieta con su estado final y un fundido corto (mismos tiempos, mismo sonido). */
  reduced: boolean;
  /** Duración de un tiempo musical en segundos (60 / BPM): las recetas de pieza cuentan en tiempos. */
  beat: number;
}

/**
 * Una receta = el DOM estático de la escena (`Component`, todo en coordenadas del escenario) + `build`, que devuelve un
 * timeline relativo y determinista: nada de tweens sueltos, `delay`, `repeat: -1` ni callbacks para sonidos. Cada
 * escena fija su estado de entrada con `set`/`fromTo`, así saltar a cualquier segundo da siempre el mismo cuadro.
 */
export interface Recipe<P extends object = Record<string, unknown>> {
  id: string;
  Component: FC<{ props: P; ratio: Ratio }>;
  build: (ctx: SceneCtx<P>) => Timeline;
  /** Sonidos atados a lo que pasa en pantalla, en segundos desde el inicio de la escena (contrato: ningún toque sin sonido). */
  cues?: (props: P, dur: number) => Cue[];
}

/** Un efecto de la escena: el motor lo corre al tiempo absoluto y lo suma a la partitura. */
export type Cue = Pick<Note, "t" | "voice"> & Partial<Pick<Note, "midi" | "dur" | "vel">>;

export const defineRecipe = <P extends object>(recipe: Recipe<P>): Recipe<P> => recipe;

/**
 * Tipos del trailer (núcleo puro, sin GSAP ni React). Un trailer es una lista de escenas como DATOS: qué receta usa
 * cada una, cuándo empieza y cuánto dura (en segundos del storyboard). El motor las arma sobre un timeline maestro.
 */
export type Ratio = "16x9" | "9x16";

export interface StageSize { w: number; h: number }

/** Escenario fijo: todo se posiciona en estas coordenadas y después se escala a la pantalla. */
export const STAGE: Record<Ratio, StageSize> = { "16x9": { w: 1920, h: 1080 }, "9x16": { w: 1080, h: 1920 } };

export interface SceneSpec<P extends object = object> {
  /** Único dentro del trailer: nombra la escena en el timeline y en `?dev=1`. */
  id: string;
  /** Receta registrada en `src/trailer/recipes` que dibuja y anima la escena. */
  recipe: string;
  start: number;
  dur: number;
  props?: P;
}

export interface TrailerSpec {
  id: string;
  title: string;
  /** Pulso de la música: los cortes caen en la grilla de medio tiempo. */
  bpm: number;
  duration: number;
  scenes: SceneSpec[];
}

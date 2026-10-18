import type { StageSize } from "./types";

export interface Fit { scale: number; x: number; y: number }

/** Escala y centra el escenario dentro de la ventana sin recortarlo (con franjas si las proporciones no coinciden). */
export function fitStage(stage: StageSize, viewW: number, viewH: number): Fit {
  if (viewW <= 0 || viewH <= 0) return { scale: 0, x: 0, y: 0 };
  const scale = Math.min(viewW / stage.w, viewH / stage.h);
  return { scale, x: (viewW - stage.w * scale) / 2, y: (viewH - stage.h * scale) / 2 };
}

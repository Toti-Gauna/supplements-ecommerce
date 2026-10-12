import type { PrizeKind } from "./wheel";

/**
 * Shaker Rush (Fase 4): reglas y premios de MUESTRA. Lo que se ve en "Cómo se juega" sale de acá, así que cambiar un
 * número cambia el juego y el texto juntos. Los premios son los de arranque: el panel los guarda en `data.game` y el
 * juego usa los guardados. En producción la tabla de premios vive en el servidor (el navegador nunca decide el premio).
 */
export type GameItemKind = "scoop" | "capsule" | "bolt" | "golden" | "burger" | "soda" | "donut";

export interface GameItemRule {
  label: string;
  /** Puntos base (antes del combo y del ×2). La chatarra no suma: saca una vida. */
  points: number;
  junk: boolean;
  /** Peso relativo dentro de su grupo (energía o chatarra). */
  weight: number;
  /** Factor sobre la velocidad de caída del momento. */
  speed: number;
  /** Radio en unidades de mundo (el campo mide 360 de ancho). */
  size: number;
}

export interface GameRules {
  durationSec: number;
  lives: number;
  /** Segundos de puntos dobles del rayo. */
  boostSec: number;
  /** Cada cuántos aciertos seguidos sube el multiplicador del combo. */
  comboStep: number;
  maxComboMult: number;
  items: Record<GameItemKind, GameItemRule>;
}

export const gameRules: GameRules = {
  durationSec: 45,
  lives: 3,
  boostSec: 6,
  comboStep: 8,
  maxComboMult: 4,
  items: {
    scoop: { label: "Scoop de proteína", points: 10, junk: false, weight: 52, speed: 1, size: 19 },
    capsule: { label: "Cápsula", points: 15, junk: false, weight: 30, speed: 1.12, size: 15 },
    bolt: { label: "Rayo ×2", points: 5, junk: false, weight: 7, speed: 1.05, size: 18 },
    golden: { label: "Scoop dorado", points: 60, junk: false, weight: 4, speed: 1.28, size: 19 },
    burger: { label: "Hamburguesa", points: 0, junk: true, weight: 34, speed: 1, size: 19 },
    soda: { label: "Gaseosa", points: 0, junk: true, weight: 33, speed: 1.08, size: 18 },
    donut: { label: "Dona", points: 0, junk: true, weight: 33, speed: 0.95, size: 18 },
  },
};

/**
 * Nivel de premio: desde `minScore` puntos se gana su cupón, que vence a los `validDays` días. Las etiquetas usan
 * espacios duros ("10 % OFF" no se corta). Se editan en el panel (Marketing → Cupones y ruleta → Premios del juego).
 */
export interface GamePrizeTier {
  id: string;
  minScore: number;
  label: string;
  kind: PrizeKind;
  value: number;
  /** Días de vigencia del cupón ganado en este nivel. */
  validDays: number;
  minSubtotal?: number;
}

export interface GamePrizeConfig {
  /** false = se sigue jugando, pero no se entregan cupones. */
  active: boolean;
  /** Ordenados de menor a mayor puntaje. */
  tiers: GamePrizeTier[];
}

export const gamePrizes: GamePrizeConfig = {
  active: true,
  tiers: [
    { id: "g-5", minScore: 300, label: "5\u00a0%\u00a0OFF", kind: "PERCENT", value: 5, validDays: 7 },
    { id: "g-10", minScore: 800, label: "10\u00a0%\u00a0OFF", kind: "PERCENT", value: 10, validDays: 7 },
    { id: "g-envio", minScore: 1500, label: "Envío gratis", kind: "FREE_SHIPPING", value: 0, validDays: 7 },
  ],
};

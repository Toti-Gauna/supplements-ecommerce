import { shakerTop, type GameEvent, type GameState } from "@/demo/engine/game";
import type { GameRules } from "@/demo/fixtures/game";
import { playSound } from "@/lib/sound";
import { ART } from "./art/sprites";
import { burst, popup, ring, shake, type Fx } from "./fx";

/** Vibración corta (Android). iOS y escritorio no la tienen: la guarda evita errores y no hace nada. */
export function vibrate(pattern: number | number[]): void {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") navigator.vibrate(pattern);
  } catch { /* sin permiso o sin soporte: el juego sigue igual */ }
}

const DUST: Record<string, string[]> = {
  scoop: [ART.cream, ART.volt, "#fff"],
  golden: [ART.gold, ART.goldLight, "#fff"],
  capsule: [ART.plasma, "#f2f4f1", ART.ion],
  bolt: [ART.volt, ART.voltSoft, ART.plasma],
};

/**
 * Lo que se ve, se oye y se siente con cada evento de la partida. Devuelve un texto para el lector de pantalla
 * cuando el evento importa (vida perdida, rayo); las capturas comunes no se anuncian para no saturar.
 */
export function feedback(e: GameEvent, s: GameState, fx: Fx, rules: GameRules): string | null {
  const top = shakerTop(s.h);
  switch (e.type) {
    case "catch": {
      const power = e.kind === "bolt" || e.kind === "golden";
      playSound(power ? "powerup" : "catch", e.combo);
      burst(fx, e.x, top, DUST[e.kind] ?? [ART.volt], power ? 18 : 9, power ? 1.3 : 1);
      popup(fx, e.x, top - 18, `+${e.points}`, power ? ART.volt : "#fff");
      if (power) { ring(fx, s.shaker.x, top + 40, e.kind === "golden" ? ART.gold : ART.volt); vibrate(20); }
      return e.kind === "bolt" ? `Rayo: puntos dobles por ${rules.boostSec} segundos.` : null;
    }
    case "junk":
      playSound("junk");
      vibrate(60);
      shake(fx);
      burst(fx, e.x, top, [ART.ember, "#ffcf4a", "#6b3b2a"], 12, 0.9);
      popup(fx, e.x, top - 18, "−1 vida", ART.ember);
      return e.lives > 0 ? `Chatarra: te ${e.lives === 1 ? "queda 1 vida" : `quedan ${e.lives} vidas`}.` : null;
    case "miss":
      return null;
    case "boost-end":
      return "Terminó el ×2.";
    case "end":
      playSound("gameover");
      vibrate([30, 50, 70]);
      return null;
  }
}

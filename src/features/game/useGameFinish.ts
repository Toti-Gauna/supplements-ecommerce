"use client";
import { useCallback } from "react";
import type { GameSummary } from "@/demo/engine/game";
import { resolveGamePrize, type GamePrizeOutcome } from "@/demo/engine/game-prize";
import { demoData } from "@/demo/engine/source";
import { gameRules } from "@/demo/fixtures/game";
import { playSound } from "@/lib/sound";
import { useAdmin } from "@/stores/admin";
import { useGame } from "@/stores/game";

export interface FinishedGame {
  summary: GameSummary;
  outcome: GamePrizeOutcome;
  newBest: boolean;
}

/**
 * Cierre de la partida: guarda el récord y resuelve el premio con las reglas del engine (una vez por día). Si gana,
 * el cupón se suma a los cupones del panel (como el de la ruleta) y queda en Mis cupones. Los premios son los guardados
 * en el panel (Premios del juego). En producción el navegador
 * solo manda el resumen de la partida: el servidor valida y emite el cupón.
 */
export function useGameFinish() {
  const addPrizeCoupon = useAdmin((s) => s.addPrizeCoupon);
  return useCallback((summary: GameSummary): FinishedGame => {
    const store = useGame.getState();
    const newBest = summary.score > 0 && summary.score > store.best;
    const outcome = resolveGamePrize({
      score: summary.score, durationSec: summary.durationSec, now: new Date(), prizes: store.prizes,
      config: demoData().game, rules: gameRules, seed: Math.random().toString(36).slice(2, 9),
    });
    store.recordGame(summary.score);
    if (outcome.kind === "won") {
      addPrizeCoupon(outcome.coupon, "Premio de Shaker Rush emitido");
      store.addPrize(outcome.record);
      window.setTimeout(() => playSound("win"), 420);
    }
    return { summary, outcome, newBest };
  }, [addPrizeCoupon]);
}

/** Texto del resultado para el lector de pantalla (se anuncia una vez, al terminar). */
export function resultText({ summary, outcome, newBest }: FinishedGame): string {
  const head = `Fin de la partida: ${summary.score.toLocaleString("es-AR")} puntos${newBest ? ", nuevo récord" : ""}.`;
  switch (outcome.kind) {
    case "won": return `${head} Ganaste ${outcome.tier.label}, cupón ${outcome.coupon.code}.`;
    case "already": return `${head} Hoy ya ganaste tu cupón (${outcome.claimed.label}); mañana podés ganar otro.`;
    case "below": return outcome.next ? `${head} Te faltaron ${outcome.next.missing} puntos para ${outcome.next.tier.label}.` : head;
    case "inactive": return `${head} Los premios del juego están pausados.`;
    case "invalid": return `${head} No pudimos validar este puntaje.`;
  }
}
